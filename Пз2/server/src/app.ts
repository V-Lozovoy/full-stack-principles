import Fastify, { type FastifyInstance } from 'fastify'
import { type Health } from './types.js'
import { notesRoutes } from './routes/notes.js'
import { registerErrorHandler } from './lib/errors.js'

/**
 * Фабрика застосунку: створює Fastify, навішує маршрути — і **не слухає порт**.
 * Порт відкриває index.ts.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.get('/api/health', async (_req, reply) => {
    const healthResponse: Health = {
      status: 'ok',
      uptime: process.uptime(),
    }
    return reply.code(200).send(healthResponse)
  })

  app.register(notesRoutes)
  registerErrorHandler(app)

  return app
}

  // TODO(1) [Пз1 · Л1]: додати маршрут GET /api/health.
  //   Результат: код 200 і JSON зі станом процесу — тип Health із ./types.js
  //   ({ "status": "ok", "uptime": 12 }).
  //   Зараз маршруту немає, тому на будь-який шлях сервер відповідає 404.
