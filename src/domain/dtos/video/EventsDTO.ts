import { Response } from "express";

export interface EventsDTO {
  userId: string;
  workspaceId: string;
  response: Response;
}