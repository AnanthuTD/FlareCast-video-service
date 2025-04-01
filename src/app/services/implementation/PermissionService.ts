import axios from "axios";
import env from "@/infra/env";
import { logger } from "@/infra/logger";
import CircuitBreaker from "opossum";

export interface PermissionCheckParams {
  userId: string;
  source: { workspaceId: string; spaceId?: string | null; folderId?: string | null };
  destination: { workspaceId: string; spaceId?: string | null; folderId?: string | null };
}

export interface PermissionResponse {
  permission: "granted" | "denied";
  folderId: string | null;
  spaceId: string | null;
  workspaceId: string | null;
}

export interface IPermissionService {
  checkPermission(params: PermissionCheckParams): Promise<PermissionResponse | null>;
}

export class PermissionService implements IPermissionService {
  private readonly breaker: CircuitBreaker;

  constructor() {
    this.breaker = new CircuitBreaker(
      async (params: PermissionCheckParams) => {
        const { data } = await axios.post<PermissionResponse>(
          `${env.COLLABORATION_API_URL}/permissions/share-file`,
          params,
          { timeout: 2000 }
        );
        return data;
      },
      {
        timeout: 2000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
      }
    );

    this.breaker.on("open", () => logger.warn("Circuit opened for permission service"));
    this.breaker.on("halfOpen", () => logger.info("Circuit half-open for permission service"));
    this.breaker.on("close", () => logger.info("Circuit closed for permission service"));
  }

  async checkPermission(params: PermissionCheckParams): Promise<PermissionResponse | null> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.breaker.fire(params);
      } catch (error) {
        lastError = error;
        logger.warn(
          `Attempt ${attempt + 1} failed to check permission for user ${params.userId}: ${
            error instanceof Error ? error.message : error
          }`
        );
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    logger.error(
      `Failed to check permission after ${maxRetries} attempts: ${
        lastError instanceof Error ? lastError.message : lastError
      }`
    );
    return null;
  }
}