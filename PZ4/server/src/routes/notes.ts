import type { FastifyInstance } from 'fastify'

import { prisma } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import {
  createNoteSchema,
  idParamSchema,
  listQuerySchema,
  updateNoteSchema,
} from '../schemas/notes.js'
import { AuthUser } from '../schemas/auth.js'

/**
 * Ті самі пʼять маршрутів, що і в Пз2. Порівняйте файли поруч: змінилося
 * лише те, ЗВІДКИ беруться дані. Контракт — адреси, коди, форма відповіді —
 * не змінився взагалі, і контрактна перевірка це підтверджує.
 *
 * Найпомітніша різниця — маршрути стали async по-справжньому: похід у базу
 * це мережевий виклик, а не звернення до масиву в памʼяті.
 */
export async function notesRoutes(app: FastifyInstance): Promise<void> {
  // TODO(5) [Пз4 · Л4, «Авторизація у routes/notes.ts: автор і роль»]: закрити маршрути і зробити дані «своїми».
  //
  //   1. app.addHook('preHandler', app.authenticate)
  //      Один хук на весь плагін — надійніше, ніж не забути його у пʼяти
  //      маршрутах. Усе нижче стає доступним лише з токеном.
  //
  //   2. POST: authorId береться з (req.user as AuthUser).id, а НЕ з тіла
  //      запиту. Інакше будь-хто створить запис від чужого імені, надіславши
  //      чужий id. Функція demoAuthorId нижче після цього не потрібна.
  //
  //   3. GET /:id, PATCH, DELETE: замість where: { id } —
  //      where: ownedWhere(req.user as AuthUser, id), і findUnique → findFirst.
  //      Чуже → 404, а не 403: 403 підтвердив би, що такий запис існує.
  //
  //   4. Список: admin бачить усе, звичайний користувач — лише свої записи.
  //
  // Як видно, що не зроблено: npm run check:auth падає на пунктах 6 і 9 —
  // список відкритий без токена, і Боб спокійно видаляє нотатку Аліси.

  // Тимчасово, доки немає автентифікації: усі записи належать одному
  // демонстраційному користувачу. Після TODO(5) ця функція зникає.
  async function demoAuthorId(): Promise<number> {
    const user = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: { email: 'demo@example.com' },
    })
    return user.id
  }

  // Усе нижче — лише з токеном. Один хук на весь плагін замість того,
  // щоб не забути дописати його в пʼяти маршрутах.
  // app.addHook('preHandler', app.authenticate)

  // Цей запит вже готовий
  app.get('/api/notes', async (req) => {
    const { q, tag, sort, order, page, limit } = listQuerySchema.parse(req.query)

    // Умови збираються обʼєктом: undefined означає «цієї умови немає».
    // Тому не потрібно ліпити ланцюжок if — Prisma просто пропустить поле.
    const user = req.user as AuthUser
    const where = {
      // Адмін бачить усе, звичайний користувач — лише свої записи.
      authorId: user.role === 'admin' ? undefined : user.id,
      title: q ? { contains: q, mode: 'insensitive' as const } : undefined,
      tags: tag ? { some: { name: tag } } : undefined,
    }

    // Список і лічильник — в одній транзакції: обидва числа з однієї миті.
    const [items, total] = await prisma.$transaction([
      prisma.note.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit, // OFFSET
        take: limit, // LIMIT
        // select, а не include: віддаємо рівно те, що потрібно списку.
        // include притягнув би автора цілком — разом із хешем пароля з Пз4.
        select: {
          id: true,
          title: true,
          text: true,
          lat: true,
          lng: true,
          visited: true,
          createdAt: true,
          tags: { select: { name: true } },
        },
      }),
      prisma.note.count({ where }),
    ])

    return { items, total, page, limit }
  })

  app.get('/api/notes/:id', async (req) => {
    const { id } = idParamSchema.parse(req.params)
    const note = await prisma.note.findUnique({
      where: { id },
      include: { tags: true },
    })
    if (!note) throw new AppError(404, 'Нотатку не знайдено')
    return note
  })

  app.post('/api/notes', async (req, reply) => {
    const { tags, ...data } = createNoteSchema.parse(req.body)

    const note = await prisma.note.create({
      data: {
        ...data,
        authorId: await demoAuthorId(),
        // connectOrCreate: існуючий тег підключаємо, новий — створюємо.
        // Одним запитом, без «спершу знайди, потім встав».
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    })

    return reply.code(201).send(note)
  })

  app.patch('/api/notes/:id', async (req) => {
    const { id } = idParamSchema.parse(req.params)
    const { tags, ...patch } = updateNoteSchema.parse(req.body)

    // Prisma кидає P2025, якщо оновлювати нема чого. Ловимо і перекладаємо
    // у наш 404 — інакше клієнт отримає 500 і незрозумілий текст.
    const exists = await prisma.note.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new AppError(404, 'Нотатку не знайдено')

    return prisma.note.update({
      where: { id },
      data: {
        ...patch,
        ...(tags
          ? {
              // set: [] спершу відчіпляє старі теги, потім чіпляє нові
              tags: {
                set: [],
                connectOrCreate: tags.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              },
            }
          : {}),
      },
      include: { tags: true },
    })
  })

  app.delete('/api/notes/:id', async (req, reply) => {
    const { id } = idParamSchema.parse(req.params)

    const exists = await prisma.note.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new AppError(404, 'Нотатку не знайдено')

    await prisma.note.delete({ where: { id } })
    return reply.code(204).send()
  })
}
