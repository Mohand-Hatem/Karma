import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { toNodeHandler } from 'better-auth/node'
import { HealthResponseSchema } from '@karma/shared'
import { env } from './config/env'
import { auth } from './auth/auth'
import { requestLogger } from './middleware/request-logger'
import { errorHandler } from './middleware/error-handler'
import { openapiSpecification } from './docs/openapi'
import { studentRouter } from './modules/students/student.routes'
import { teacherRouter } from './modules/teachers/teacher.routes'
import { academicRouter } from './modules/academic/academic.routes'
import { resultRouter } from './modules/results/result.routes'
import { lessonRouter } from './modules/lessons/lesson.routes'
import { assignmentRouter } from './modules/assignments/assignment.routes'

export function createApp(): Express {
  const app = express()

  app.use(requestLogger)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI interactive bundle assets to render
    })
  )
  app.use(cors({ origin: env.WEB_URL, credentials: true }))

  // Swagger Documentation Endpoints
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
  app.get('/docs.json', (_req, res) => {
    res.status(200).json(openapiSpecification)
  })

  // Better Auth
  app.all('/api/auth/{*splat}', toNodeHandler(auth))

  app.use(express.json())

  // Health check
  app.get('/healthz', (_req, res) => {
    const payload = HealthResponseSchema.parse({ status: 'ok', timestamp: new Date().toISOString() })
    res.status(200).json(payload)
  })

  // Domain Module Routes
  app.use('/api/students', studentRouter)
  app.use('/api/teachers', teacherRouter)
  app.use('/api/academic', academicRouter)
  app.use('/api/results', resultRouter)
  app.use('/api/lessons', lessonRouter)
  app.use('/api/assignments', assignmentRouter)

  app.use(errorHandler)

  return app
}
