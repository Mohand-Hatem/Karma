import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod'

export function validateBody<T>(schema: ZodType<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function validateQuery<T>(schema: ZodType<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = (await schema.parseAsync(req.query)) as never
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function validateParams<T>(schema: ZodType<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as never
      next()
    } catch (err) {
      next(err)
    }
  }
}
