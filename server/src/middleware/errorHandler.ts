import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors,
    });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({ success: false, error: err.message });
    return;
  }
  res.status(500).json({ success: false, error: 'Internal server error' });
}
