import { PrismaClient } from "@prisma/client";
import { ChatEntity } from "@/domain/entities/Chat";
import { IChatRepository } from "@/app/repository/IChatRepository";
import prisma from "@/infra/databases/prisma/connection";

export class ChatRepository implements IChatRepository {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = prisma;
	}

	private static toDomainEntity(prismaChat: any): ChatEntity {
		return new ChatEntity({
			id: prismaChat.id,
			videoId: prismaChat.videoId,
			userId: prismaChat.userId || null,
			message: prismaChat.message,
			repliedToId: prismaChat.repliedToId || null,
			createdAt: prismaChat.createdAt,
			sessionId: prismaChat.sessionId,
		});
	}

	async createChat(params: {
		videoId: string;
		userId?: string;
		message: string;
		sessionId: string;
		repliedToId?: string;
	}): Promise<ChatEntity> {
		const prismaChat = await this.prisma.chat.create({
			data: {
				videoId: params.videoId,
				userId: params.userId,
				message: params.message,
				sessionId: params.sessionId,
				repliedToId: params.repliedToId,
			},
		});
		return ChatRepository.toDomainEntity(prismaChat);
	}

	async clearSession(sessionId: string): Promise<void> {
		await this.prisma.$transaction(async (tx) => {
			const chats = await tx.chat.findMany({
				where: { sessionId },
				select: { id: true },
			});

			const chatIds = chats.map((chat) => chat.id);

			await tx.chat.updateMany({
				where: {
					repliedToId: { in: chatIds },
					sessionId,
				},
				data: { repliedToId: null },
			});

			await tx.chat.deleteMany({
				where: { sessionId },
			});
		});
	}

	async findChatsBySession(params: {
		sessionId: string;
		limit: number;
		cursor?: string;
	}): Promise<ChatEntity[]> {
		const chats = await this.prisma.chat.findMany({
			where: { sessionId: params.sessionId },
			take: params.limit,
			orderBy: { createdAt: "desc" },
			cursor: params.cursor ? { createdAt_id: params.cursor } : undefined,
			skip: params.cursor ? 1 : 0,
			include: {
				user: { select: { id: true, fullName: true } },
				repliedTo: {
					include: { user: { select: { id: true, fullName: true } } },
				},
			},
		});
		return chats.map(ChatRepository.toDomainEntity);
	}

	async findChatHistoryBySession(
		sessionId: string,
		limit: number = 5
	): Promise<ChatEntity[]> {
		const chats = await this.prisma.chat.findMany({
			where: { sessionId },
			orderBy: { createdAt: "asc" },
			take: limit,
			include: {
				repliedTo: { select: { message: true, userId: true } },
			},
		});
		return chats.map(ChatRepository.toDomainEntity);
	}
}
