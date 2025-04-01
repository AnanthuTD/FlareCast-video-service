import { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger"; // Adjust path to your logger

interface CustomError extends Error {
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  res.status(status).json({
    status: "error",
    message: status === 500 ? "Something went wrong on the server" : err.message,
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
};