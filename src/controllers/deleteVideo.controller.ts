import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import env from "../env";
import { logger } from "../logger/logger";
import { Video } from "@prisma/client";
import s3Client from "../s3";

interface User {
  id: string;
  // Add other user fields as needed (e.g., email, role)
}

export const deleteVideoController: RequestHandler = async (req, res) => {
  const { videoId } = req.params as { videoId: string };
  const userId = (req.user as User)?.id;

  // TODO: Should check the user has necessary permissions (implement below)
  try {
    // Check if the video exists and the user has permission
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    }) as Video | null;

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // TODO: check user has necessary permissions

    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Prefix: `${videoId}/`,
      })
    );

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      // Prepare objects to delete
      const objectsToDelete = listResponse.Contents.map(object => ({
        Key: object.Key!,
      }));

      // Delete all objects in the prefix
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Delete: {
            Objects: objectsToDelete,
            Quiet: true, // Suppress individual deletion responses
          },
        })
      );

      logger.info(`Successfully deleted S3 objects for video ${videoId} from gcs/${videoId}/`);
    } else {
      logger.warn(`No S3 objects found for video ${videoId} in gcs/${videoId}/`);
    }

    // Delete the video record from Prisma
    await prisma.video.delete({
      where: { id: videoId },
    });

    logger.info(`Successfully deleted video ${videoId} from database and S3`);
    return res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    logger.error(`Failed to delete video ${videoId}: ${error.message}`);
    return res.status(500).json({ message: "Failed to delete video" });
  }
};