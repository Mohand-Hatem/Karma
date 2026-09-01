import pinoHttp from 'pino-http'
import { randomUUID } from 'node:crypto'

export const requestLogger = pinoHttp({
  genReqId: (req) => (req.headers['x-request-id'] as string) ?? randomUUID(),
})
