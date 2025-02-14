import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class VideoRepository {
  static async createVideo(userId: string, workspaceId: string, folderId: string) {
    return await prisma.video.create({
      data: {
        userId,
        workspaceId,
        folderId,
      },
    });
  }

  static async updateProcessingStatus(videoId: string, status: boolean) {
    return await prisma.video.update({
      where: { id: videoId },
      data: { processing: status },
    });
  }
}
