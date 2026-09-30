import jwt from '@fastify/jwt'
import Fastify, { type FastifyInstance } from 'fastify'

import { registerErrorHandler } from './lib/errors.js'
import { authenticate } from './plugins/auth.js'
import { authRoutes } from './routes/auth.js'
import { notesRoutes } from './routes/notes.js'
import type { AuthUser } from './schemas/auth.js'
import type { Health } from './types.js'

// Кажемо TypeScript, що саме лежить у req.user після jwtVerify,
// і що в застосунку зʼявився декоратор app.authenticate.
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate
  }
}
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthUser
  }
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.register(jwt, {
    // Дефолт — лише щоб застосунок піднявся локально. У проді змінна
    // обовʼязкова: секрет у коді — це секрет, який уже витік.
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    // Без expiresIn токен живе вічно, і його витік — це доступ назавжди.
    sign: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
  })

  app.decorate('authenticate', authenticate)

  app.get('/api/health', async (): Promise<Health> => ({
    status: 'ok',
    uptime: process.uptime(),
  }))

  app.register(authRoutes)
  app.register(notesRoutes)

  registerErrorHandler(app)

  return app
}
