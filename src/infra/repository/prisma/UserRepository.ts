import { IUserRepository } from "@/app/repository/IUserRepository";
import prisma from "@/infra/databases/prisma/connection";

export class UserRepository implements IUserRepository {
	create(user: any): Promise<any> {
		return prisma.user.create(user);
	}

	findById(id: string): Promise<any> {
		return prisma.user.findFirst({
			where: { id },
		});
	}

	searchByName(query: string) {
		return prisma.user.findMany({
			where: {
				OR: [{ fullName: { contains: query } }],
			},
		});
	}
}
