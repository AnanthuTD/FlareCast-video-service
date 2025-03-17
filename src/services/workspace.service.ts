import axios from "axios";
import env from "../env";

export class WorkspaceService {
	static async getSelectedWorkspace(
		userId: string,
		workspaceId?: string,
		folderId?: string
	): Promise<string> {
		try {
			const url = workspaceId
				? `${
						env.COLLABORATION_API_URL
				  }/workspace/${userId}/selected?workspaceId=${workspaceId}&folderId=${
						folderId || ""
				  }`
				: `${env.COLLABORATION_API_URL}/workspace/${userId}/selected`;

			const response = await axios.get(url);
			return response.data.selectedWorkspace;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(
					`Unable to retrieve workspace: ${error.response?.data?.message}`
				);
			}
			throw new Error("Unknown error occurred while fetching workspace.");
		}
	}
}
