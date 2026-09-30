import type { FastifyReply, FastifyRequest } from 'fastify'

import type { AuthUser } from '../schemas/auth.js'

/**
 * preHandler «хто ти». Перевіряє підпис токена і його строк життя.
 * Не пройшло — 401 і запит далі не йде.
 *
 * return reply тут обовʼязковий: без нього Fastify пішов би в обробник
 * і виконав його вже після того, як відповідь відправлено.
 */
export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify()
  } catch {
    return reply.code(401).send({ error: 'Потрібна автентифікація' })
  }
}

/**
 * preHandler «що тобі можна». Ставиться ПІСЛЯ authenticate:
 * спершу дізнаємось, хто це, потім — чи має він права.
 */
export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as AuthUser | undefined
  if (!user || user.role !== 'admin') {
    return reply.code(403).send({ error: 'Потрібні права адміністратора' })
  }
}

/**
 * Фільтр «своє або все, якщо адмін».
 *
 * Ключова думка Л4: авторизація — це не лише хук на вході, а УМОВА в
 * кожному запиті до бази. Хук каже, хто ви; ось цей where каже, що саме
 * вам дозволено чіпати. Забули його в одному маршруті — саме там і буде IDOR.
 */
export function ownedWhere(user: AuthUser, id: number) {
  return user.role === 'admin' ? { id } : { id, authorId: user.id }
}
