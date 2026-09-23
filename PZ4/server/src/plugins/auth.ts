import type { FastifyReply, FastifyRequest } from 'fastify'

import type { AuthUser } from '../schemas/auth.js'

// TODO(3) [Пз4 · Л4, «@fastify/jwt» і «Авторизація у routes/notes.ts»]: три функції, на яких тримається вся авторизація.
//
//   authenticate(req, reply)
//     await req.jwtVerify() — перевіряє підпис і строк життя, кладе payload
//     у req.user. Не пройшло → reply.code(401).
//     ВАЖЛИВО: пишемо `return reply.code(401).send(...)`. Без return Fastify
//     піде далі в обробник і виконає його вже після відправленої відповіді.
//
//   requireAdmin(req, reply)
//     req.user.role !== 'admin' → 403. Ставиться ПІСЛЯ authenticate:
//     спершу «хто ти», потім «що тобі можна».
//     Роль беремо з req.user (тобто з токена) і ніколи — з req.body.
// const user = req.user as AuthUser | undefined
//   if (!user || user.role !== 'admin') {
//     return reply.code(403).send({ error: 'Потрібні права адміністратора' })
//   }
//
//   ownedWhere(user, id)
//     Повертає умову для запиту в базу:
//       адмін         → { id }
//       звичайний     → { id, authorId: user.id }
//
//     Це головна думка Л4: авторизація — не лише хук на вході, а УМОВА
//     в кожному запиті до бази. Хук каже, хто ви; where каже, що саме вам
//     дозволено чіпати. Забули where в одному маршруті — саме там IDOR.
//
// Як видно, що не зроблено: npm run check:auth падає на пунктах 6 і 9.

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  // сюди — jwtVerify і 401
  try {
    await req.jwtVerify()
  } catch {
    return reply.code(401).send({ error: 'Потрібна автентифікація' })
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  // сюди — перевірка ролі і 403
  const user = req.user as AuthUser | undefined
  if (!user || user.role !== 'admin') {
    return reply.code(403).send({ error: 'Потрібні права адміністратора' })
  }
}

export function ownedWhere(user: AuthUser, id: number) {
  // (частина TODO(3)) адмін бачить усе, решта — лише своє
  return user.role === 'admin' ? { id } : { id, authorId: user.id }
}
