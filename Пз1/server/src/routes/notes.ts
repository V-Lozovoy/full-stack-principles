import type { FastifyInstance } from 'fastify'

import { AppError } from '../lib/errors.js'
import { store } from '../lib/store.js'
import { idParamSchema, listQuerySchema } from '../schemas/notes.js'
import type { Note, Page } from '../../../../Пз2/server/src/types.js'

/**
 * Плагін Fastify — група маршрутів однієї сутності в одному файлі.
 * Зʼявиться друга сутність — буде routes/tags.ts, а app.ts не зміниться.
 *
 * Жодного try/catch: усі помилки ловить setErrorHandler із lib/errors.ts.
 *
 * Два маршрути читання нижче вже готові — це зразки. Три маршрути запису
 * (POST, PATCH, DELETE) пишете ви за тим самим шаблоном.
 */
export async function notesRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/notes — список із фільтром і сторінками.
  // Зразок «як читати»: спершу parse, потім store, у відповідь — обгортка.
  app.get('/api/notes', async (req): Promise<Page<Note>> => {
    const { q, tag, page, limit } = listQuerySchema.parse(req.query)

    const found = store
      .all()
      .filter((n) => !q || n.title.toLowerCase().includes(q.toLowerCase()))
      .filter((n) => !tag || n.tags.includes(tag))

    return {
      items: found.slice((page - 1) * limit, page * limit),
      total: found.length,
      page,
      limit,
    }
  })

  // GET /api/notes/:id — одна нотатка або чесний 404.
  // Зразок «як працювати з :id»: параметр парситься схемою, «немає» — AppError.
  app.get('/api/notes/:id', async (req): Promise<Note> => {
    const { id } = idParamSchema.parse(req.params)
    const note = store.byId(id)
    if (!note) throw new AppError(404, 'Нотатку не знайдено')
    return note
  })

  // TODO(2) [Пз2 · Л2, «Fastify: застосунок і плагін маршрутів»]: три маршрути запису.
  //
  //   POST   /api/notes      → 201 і створений обʼєкт у тілі
  //   PATCH  /api/notes/:id  → 200 і оновлений обʼєкт; 404, якщо немає
  //   DELETE /api/notes/:id  → 204 без тіла; 404, якщо немає
  //
  // Пишуться за зразками вище, відрізняються тільки дрібниці:
  //
  //   POST — другий аргумент (req, reply), тіло парситься схемою:
  //     app.post('/api/notes', async (req, reply): Promise<Note> => {
  //       const data = createNoteSchema.parse(req.body)
  //       return reply.code(201).send(store.create(data))
  //     })
  //
  //   PATCH — ід параметром, і тіло схемою updateNoteSchema (всі поля
  //   необовʼязкові — вона .partial()):
  //     const { id } = idParamSchema.parse(req.params)
  //     const patch = updateNoteSchema.parse(req.body)
  //     const note = store.update(id, patch)
  //     if (!note) throw new AppError(404, 'Нотатку не знайдено')
  //     return note
  //
  //   DELETE — як GET /:id, але 204 і без тіла:
  //     if (!store.remove(id)) throw new AppError(404, 'Нотатку не знайдено')
  //     return reply.code(204).send()
  //
  // Правила, за якими перевірятиму:
  //   • жодного try/catch — помилки ловить setErrorHandler із lib/errors.ts;
  //   • дані НЕ читаємо з req.body напряму: спершу schema.parse(req.body);
  //   • «не знайшли» — це throw new AppError(404, '...'), а не reply.code(404)
  //     у кожному місці.
  //
  // Як видно, що не зроблено: POST віддає 404, і тести перевірок 3–5 червоні.
}
