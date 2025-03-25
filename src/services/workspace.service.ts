import axios from "axios";
import env from "../env";
import CircuitBreaker from "opossum";

export class WorkspaceService {
  private static workspaceServiceBreaker = new CircuitBreaker(
    async (userId: string, workspaceId?: string, folderId?: string) => {
      const url = workspaceId
        ? `${
            env.COLLABORATION_API_URL
          }/workspace/${userId}/selected?workspaceId=${workspaceId}&folderId=${
            folderId || ""
          }`
        : `${env.COLLABORATION_API_URL}/workspace/${userId}/selected`;

      const response = await axios.get(url, { timeout: 2000 }); // 2-second timeout per request
      return response.data;
    },
    {
      timeout: 2000, // Timeout after 2 seconds
      errorThresholdPercentage: 50, // Trip if 50% of requests fail
      resetTimeout: 30000, // Retry after 30 seconds
    }
  );

  static {
    WorkspaceService.workspaceServiceBreaker.on("open", () =>
      console.log("Circuit opened for workspace service")
    );
    WorkspaceService.workspaceServiceBreaker.on("halfOpen", () =>
      console.log("Circuit half-open for workspace service")
    );
    WorkspaceService.workspaceServiceBreaker.on("close", () =>
      console.log("Circuit closed for workspace service")
    );
  }

  static async getSelectedWorkspace(
    userId: string,
    workspaceId?: string,
    folderId?: string
  ): Promise<string> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const data = await WorkspaceService.workspaceServiceBreaker.fire(
          userId,
          workspaceId,
          folderId
        );
        return data.selectedWorkspace;
      } catch (error) {
        lastError = error;
        console.warn(
          `Attempt ${attempt + 1} failed to fetch workspace for user ${userId}: ${
            error instanceof Error ? error.message : error
          }`
        );

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt))); // Exponential backoff: 1s, 2s
        }
      }
    }

    // All retries failed or circuit is open
    console.error(
      `Failed to fetch workspace for user ${userId} after ${maxRetries} attempts: ${
        lastError instanceof Error ? lastError.message : lastError
      }`
    );

    if (axios.isAxiosError(lastError)) {
      throw new Error(
        `Unable to retrieve workspace: ${lastError.response?.data?.message || "Unknown error"}`
      );
    }
    throw new Error("Unknown error occurred while fetching workspace.");
  }
}