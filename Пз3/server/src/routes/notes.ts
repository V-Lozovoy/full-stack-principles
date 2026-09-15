import type { FastifyInstance } from 'fastify'

import { prisma } from '../lib/db.js'
import { listQuerySchema } from '../schemas/notes.js'

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
  void prisma
}
