import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { HealthResponseSchema } from '@karma/shared'
import { env } from './config/env'
import { requestLogger } from './middleware/request-logger'
import { errorHandler } from './middleware/error-handler'

export function createApp(): Express {
  const app = express()

  app.use(requestLogger)
  app.use(helmet())
  app.use(cors({ origin: env.WEB_URL, credentials: true }))
  app.use(express.json())

  app.get('/healthz', (_req, res) => {
    const payload = HealthResponseSchema.parse({ status: 'ok', timestamp: new Date().toISOString() })
    res.status(200).json(payload)
  })

  app.use(errorHandler)

  return app
}
