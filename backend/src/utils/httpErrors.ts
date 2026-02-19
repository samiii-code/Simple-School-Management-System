import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Not found"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const e = err instanceof HttpError ? err : new HttpError(500, "Internal server error");
  const payload: Record<string, unknown> = { message: e.message };
  if (e.details !== undefined) payload.details = e.details;
  res.status(e.status).json(payload);
}

