import Fastify, { type FastifyInstance } from 'fastify'

import { registerErrorHandler } from './lib/errors.js'
import { notesRoutes } from './routes/notes.js'
import type { Health } from './types.js'

/**
 * Фабрика застосунку: створює Fastify, навішує маршрути — і **не слухає порт**.
 * Порт відкриває index.ts.
 *
 * Розділення потрібне не заради краси: саме тому тест із tests/notes.test.ts
 * піднімає застосунок у власному процесі і стукає в нього через supertest —
 * без порта 3000 і без другого термінала.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.get('/api/health', async (): Promise<Health> => ({
    status: 'ok',
    uptime: process.uptime(),
  }))

  app.register(notesRoutes)

  // Один обробник помилок і один обробник невідомого маршруту — в кінці,
  // коли всі маршрути вже зареєстровані.
  registerErrorHandler(app)

  return app
}
