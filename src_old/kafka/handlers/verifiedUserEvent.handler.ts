import { logger } from "../../logger/logger";
import prisma from "../../prismaClient";

interface UserVerifiedEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export async function handleUserVerifiedEvent(value: UserVerifiedEvent) {
	logger.info("New verified user data received", value);

	try {
		await prisma.user.create({
			data: {
				id: value.userId,
				fullName: value.firstName + (value.lastName ?? ""),
				image: value.image ?? "",
			},
		});
	} catch (error) {
		logger.error("Error creating user:", error);
	}
}