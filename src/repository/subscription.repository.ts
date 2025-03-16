import axios from "axios";
import env from "../env";

interface SubscriptionLimitsResponse {
	message: string;
	permission: 'granted' | 'denied';
	maxVideoCount: number;
	totalVideoUploaded: number;
	aiFeature: boolean;
	maxRecordDuration: number; // in minutes
}

export class SubscriptionRepository {
	static async getLimits(userId: string): Promise<SubscriptionLimitsResponse> {
		const { data } = await axios.get(
			`${env.USER_SERVICE_API}/api/services/${userId}/upload-permission`
		);
		return data;
	}
}
