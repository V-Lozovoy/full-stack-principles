import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

/**
 * «Очікувана» помилка: та, яку ми самі передбачили і для якої знаємо код.
 * Усе інше — несподіванка, і клієнт про неї дізнається лише як про 500.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Один обробник на все API. Маршрути завдяки йому пишуться без try/catch:
 * кинули помилку — вона сама перетвориться на правильний код і формат.
 *
 * Формат відповіді однаковий завжди: { error } або { error, details }.
 * Клієнт (Пз5) читає його одним шматком коду — див. api/client.ts.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err, req, reply) => {
    // 1. Не пройшла валідація zod — 400 і розбивка по полях.
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => ({
        field: issue.path.join('.') || '(тіло запиту)',
        message: issue.message,
      }))
      return reply.code(400).send({ error: 'Помилка валідації', details })
    }

    // 2. Наша власна помилка — код і повідомлення беремо з неї.
    if (err instanceof AppError) {
      return reply.code(err.statusCode).send({ error: err.message })
    }

    // 3. Помилка самого Fastify з людським кодом: зіпсований JSON у тілі,
    //    завеликий запит тощо. Віддаємо як є, у нашому форматі.
    const { statusCode, message } = err as { statusCode?: number; message?: string }
    if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
      return reply.code(statusCode).send({ error: message ?? 'Некоректний запит' })
    }

    // 4. Усе решта — наш баг. Стек іде в лог, клієнту — загальний текст.
    req.log.error(err)
    return reply.code(500).send({ error: 'Внутрішня помилка сервера' })
  })

  // Невідомий маршрут теж має віддавати JSON, а не HTML-сторінку Fastify.
  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: 'Маршрут не знайдено' })
  })
}
