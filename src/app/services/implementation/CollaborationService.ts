import env from "@/infra/env";
import { logger } from "@/infra/logger";
import axios from "axios";
import CircuitBreaker from "opossum";
import { ICollaborationService } from "../ICollaborationService";

export class CollaborationService implements ICollaborationService {
  private readonly breaker: CircuitBreaker;

  constructor() {
    this.breaker = new CircuitBreaker(
      async (spaceId: string, userId: string) => {
        const { data } = await axios.get(
          `${env.COLLABORATION_API_URL}/permissions/${spaceId}/space/${userId}/isMember`,
          { timeout: 2000 }
        );
        return data.isMember;
      },
      {
        timeout: 2000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
      }
    );

    this.breaker.on("open", () =>
      logger.warn("Circuit opened for collaboration service")
    );
    this.breaker.on("halfOpen", () =>
      logger.info("Circuit half-open for collaboration service")
    );
    this.breaker.on("close", () =>
      logger.info("Circuit closed for collaboration service")
    );
  }

  async isSpaceMember(spaceId: string, userId: string): Promise<boolean | null> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.breaker.fire(spaceId, userId);
      } catch (error) {
        lastError = error;
        logger.warn(
          `Attempt ${attempt + 1} failed checking permission for user ${userId} in space ${spaceId}: ${
            error instanceof Error ? error.message : error
          }`
        );
        console.error(error)
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    logger.error(
      `Failed to check user permission after ${maxRetries} attempts: ${
        lastError instanceof Error ? lastError.message : lastError
      }`
    );
    return null; // Indicates failure after retries
  }
}