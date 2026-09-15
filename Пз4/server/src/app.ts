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

  // TODO(4) [Пз4 · Л4, «@fastify/jwt: реєстрація плагіна і два preHandler»]: підключити @fastify/jwt.
  //
  //   secret: process.env.JWT_SECRET ?? 'dev-secret-...'
  //     Дефолт — лише щоб застосунок піднявся локально. У проді змінна
  //     обовʼязкова: секрет у коді — це секрет, який уже витік.
  //
  //   sign: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' }
  //     Без expiresIn токен живе вічно, і його витік — доступ назавжди.
  //     Це найлегший рядок для того, щоб забути, і найдорожчий.
  //
  //   app.decorate('authenticate', authenticate)
  //     щоб у маршрутах писати { preHandler: [app.authenticate] }
  //
  // Як видно, що не зроблено: сервер падає на app.jwt.sign — плагіна немає.

  // app.register(jwt, {
  //   secret: ,
  //   sign: ,
  // })
  // app.decorate('authenticate', authenticate)

  app.get('/api/health', async (): Promise<Health> => ({
    status: 'ok',
    uptime: process.uptime(),
  }))

  app.register(authRoutes)
  app.register(notesRoutes)

  registerErrorHandler(app)

  return app
}
