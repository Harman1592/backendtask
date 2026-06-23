import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors.js';
import { logger } from '@utils/logger.js';
import { sendError } from '@utils/response.js';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', error);

  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
    return;
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    sendError(res, 'Validation error', 400, 'VALIDATION_ERROR');
    return;
  }

  // Handle unknown errors
  sendError(res, 'Internal server error', 500);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
