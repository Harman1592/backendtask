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

  const err: any = error;

  // Handle malformed JSON body parsing errors
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    sendError(res, 'Invalid JSON payload', 400, 'BAD_REQUEST');
    return;
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    sendError(res, 'Validation error', 400, 'VALIDATION_ERROR');
    return;
  }

  // Handle generic bad request errors from body parser
  if (err.status === 400 || err.statusCode === 400) {
    sendError(res, err.message || 'Bad request', 400);
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
