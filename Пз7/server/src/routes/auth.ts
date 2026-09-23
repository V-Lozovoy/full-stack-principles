import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'

import { prisma } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import { credentialsSchema } from '../schemas/auth.js'

/** Скільки раундів рахує bcrypt: 10 → 2^10. «Повільно» тут — це перевага. */
const BCRYPT_COST = 10

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register → 201 { id, email }
  app.post('/api/auth/register', async (req, reply) => {
    const { email, password } = credentialsSchema.parse(req.body)

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) throw new AppError(409, 'Користувач з таким email уже існує')

    // Сіль генерується всередині і зберігається в самому рядку хеша,
    // тому окремого поля salt у схемі немає і бути не повинно.
    const hash = await bcrypt.hash(password, BCRYPT_COST)

    const user = await prisma.user.create({
      data: { email, password: hash },
    })

    // У відповіді немає ні пароля, ні хеша. Ніколи.
    return reply.code(201).send({ id: user.id, email: user.email })
  })

  // POST /api/auth/login → 200 { token }
  app.post('/api/auth/login', async (req) => {
    const { email, password } = credentialsSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })

    // Одна відповідь на «немає такого» і «невірний пароль».
    // Різні тексти дозволили б за 401 перебирати чужі email.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Невірний email або пароль')
    }

    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return { token }
  })

  // GET /api/auth/me → хто я зараз. Клієнту на Пз5 це знадобиться,
  // щоб показати email у шапці, не розбираючи токен руками.
  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (req) => req.user)
}
