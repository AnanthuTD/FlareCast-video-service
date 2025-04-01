import { logger } from "@/infra/logger";
import { IEventHandler } from "../interfaces/IEventHandler";
import { IUserRepository } from "../repository/IUserRepository";

export class VerifiedUserHandler implements IEventHandler {
	constructor(private readonly usersRepository: IUserRepository) {}

	async handle(
		topic: string,
		data: {
			userId: string;
			firstName: string;
			lastName?: string;
			email: string;
			image?: string;
			plan?: any;
		}
	): Promise<void> {
		try {
			logger.debug(
				`✔️ Received a verified user event: ${JSON.stringify(data.userId)}`
			);

			const existingUser = await this.usersRepository.findById(data.userId);

			if (existingUser) {
				logger.info(
					`User with id ${data.userId} already exists. Updating details.`
				);
				return;
			}

			await this.usersRepository.create({
				id: data.userId,
				fullName: data.firstName + (data.lastName ?? ""),
				image: data.image ?? "",
			});
		} catch (error) {
			logger.error("Failed to handle verified user event:", error);
			throw error;
		}
	}
}
