import Fastify, { type FastifyInstance } from 'fastify'

/**
 * Фабрика застосунку: створює Fastify, навішує маршрути — і **не слухає порт**.
 * Порт відкриває index.ts.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  // TODO(1) [Пз1 · Л1]: додати маршрут GET /api/health.
  //   Результат: код 200 і JSON зі станом процесу — тип Health із ./types.js
  //   ({ "status": "ok", "uptime": 12 }).
  //   Зараз маршруту немає, тому на будь-який шлях сервер відповідає 404.

  // Дано готовим: щоб на невідомий шлях приходив JSON, а не HTML-сторінка Fastify.
  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: 'Маршрут не знайдено' })
  })

  return app
}
