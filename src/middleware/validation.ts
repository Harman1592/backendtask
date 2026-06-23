import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '@utils/response.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const message = error.errors
        ? error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Validation failed';
      sendError(res, message, 400, 'VALIDATION_ERROR');
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors
        ? error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        : 'Validation failed';
      sendError(res, message, 400, 'VALIDATION_ERROR');
    }
  };
};
