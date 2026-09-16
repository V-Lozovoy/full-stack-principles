import type { FastifyInstance } from 'fastify'

import { prisma } from '../lib/db.js'
import { listQuerySchema, createNoteSchema, updateNoteSchema, idParamSchema } from '../schemas/notes.js'
import { AppError } from '../lib/errors.js'

/**
 * Ті самі пʼять маршрутів, що і в Пз2 — але дані тепер із бази.
 *
 * Порівняйте файли Пз2 і Пз3 поруч: контракт (адреси, коди, форма
 * відповіді) не змінився взагалі. Змінилося лише те, ЗВІДКИ беруться дані.
 * Саме тому той самий npm test має лишитися зеленим.
 */
export async function notesRoutes(app: FastifyInstance): Promise<void> {
  // ── Дано як зразок: список. Решту чотири маршрути пишете за цим прикладом.
  app.get('/api/notes', async (req) => {
    const { q, sort, order, page, limit } = listQuerySchema.parse(req.query)

    // Умови — звичайний обʼєкт. undefined означає «цієї умови немає»,
    // тому ланцюжок if не потрібен: Prisma просто пропустить поле.
    const where = {
      title: q ? { contains: q, mode: 'insensitive' as const } : undefined,
    }

    // Список і лічильник — однією транзакцією, щоб обидва числа були
    // з однієї миті, а не з двох різних.
    const [items, total] = await prisma.$transaction([
      prisma.note.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit, // це OFFSET
        take: limit, // це LIMIT
      }),
      prisma.note.count({ where }),
    ])

    return { items, total, page, limit }
  })

  app.get('/api/notes/:id', async (req) => {
    const { id } = idParamSchema.parse(req.params)
    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) throw new AppError(404, 'Нотатку не знайдено')
    return note
  })

  app.post('/api/notes', async (req, reply) => {
    const { tags, ...data } = createNoteSchema.parse(req.body)
    const author = await prisma.user.findFirst()
    if (!author) throw new AppError(500, 'Немає користувача. Запустіть npx prisma db seed')
    
    const note = await prisma.note.create({
      data: { 
        ...data, 
        authorId: author.id,
        tags: { connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
      })),
    },
  },
})

  reply.code(201)
  return note
})

    app.patch('/api/notes/:id', async (req) => {
    const { id } = idParamSchema.parse(req.params)
    const { tags, ...data } = updateNoteSchema.parse(req.body)

    // Перевіряємо існування заздалегідь: без цього Prisma кине P2025
    // на неіснуючому id, і клієнт отримає 500 замість 404.
    const existing = await prisma.note.findUnique({
      where: { id },
      select: { id: true },
    })
    
    if (!existing) throw new AppError(404, 'Нотатку не знайдено')

    const note = await prisma.note.update({
      where: { id },
      data: { ...data, ...(tags && {
        tags: {
          set: [],
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    },
  })
  
  return note
})

  app.delete('/api/notes/:id', async (req, reply) => {
    const { id } = idParamSchema.parse(req.params)
    const existing = await prisma.note.findUnique({ where: { id }, select: { id: true } })
    
    if (!existing) throw new AppError(404, 'Нотатку не знайдено')

    await prisma.note.delete({ where: { id } })
    reply.code(204)
})

  // TODO(2) [Пз3 · Л3, «Prisma Client» і «Список із бази»]: перевести решту маршрутів на Prisma.
  //
  // Результат: усі вісім перевірок npm test знову зелені, а дані
  // переживають перезапуск сервера.
  //
  //   GET    /api/notes/:id  → prisma.note.findUnique({ where: { id } })
  //                            немає → throw new AppError(404, ...)
  //   POST   /api/notes      → prisma.note.create({ data })  → 201
  //   PATCH  /api/notes/:id  → prisma.note.update({ where, data })
  //   DELETE /api/notes/:id  → prisma.note.delete({ where })  → 204
  //
  // Три речі, на яких спотикаються:
  //
  //   • update і delete на неіснуючому id кидають помилку Prisma P2025,
  //     і клієнт отримає 500 замість 404. Перевіряйте наявність запису
  //     заздалегідь (findUnique + select: { id: true }) і кидайте AppError(404).
  //
  //   • select проти include: include тягне звʼязаний запис ЦІЛКОМ. У Пз4
  //     у користувача зʼявиться хеш пароля — і include віддасть його клієнту.
  //     Для списку беріть select із переліком потрібних полів.
  //
  //   • звʼязки у create: тег не «створити, якщо немає» руками, а
  //     tags: { connectOrCreate: [...] } — одним запитом.
  //
  // Як видно, що не зроблено: POST повертає 404, бо маршруту ще немає.
}
