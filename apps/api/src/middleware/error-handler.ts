import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.headers['x-request-id'] ?? 'unknown'
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
      requestId,
    })
    return
  }
  req.log?.error({ err }, 'unhandled error')
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    requestId,
  })
}
