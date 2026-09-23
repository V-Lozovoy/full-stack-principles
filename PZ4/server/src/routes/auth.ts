import type { FastifyInstance } from 'fastify'
import { credentialsSchema } from '../schemas/auth.js'
import { prisma } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import bcrypt, { hash } from 'bcryptjs'

// TODO(2) [Пз4 · Л4, «Реєстрація і логін: bcrypt»]: реєстрація і вхід.
//
//   POST /api/auth/register → 201 { id, email }
//     1. credentialsSchema.parse(req.body)
//     2. email уже є → throw new AppError(409, ...)
//     3. bcrypt.hash(password, 10) — сіль генерується всередині і лежить
//        у самому рядку хеша, тому окремого поля salt не треба
//     4. prisma.user.create({ data: { email, password: hash } })
//     5. у відповіді — ТІЛЬКИ { id, email }. Ні пароля, ні хеша. Ніколи.

//   POST /api/auth/login → 200 { token }
//     1. знайти користувача, bcrypt.compare(password, user.password)
//     2. не знайшли АБО пароль не збігся → ОДНА І ТА САМА помилка 401
//        з одним і тим самим текстом. Різні тексти дозволяють за 401
//        перебирати чужі email — це перевіряє пункт 5 у check:auth.
//     3. app.jwt.sign({ id, email, role }) — payload видно всім, тому
//        нічого таємного туди не кладемо
//
//   GET /api/auth/me → хто я зараз (знадобиться клієнту на Пз5)
//     { preHandler: [app.authenticate] }, повертає req.user
//
// Як видно, що не зроблено: npm run check:auth падає з першого пункту.

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/auth/register → 201 { id, email }
  app.post('/api/auth/register', async (req, reply) => {
    const { email, password } = credentialsSchema.parse(req.body)
    
    const exists = await prisma.user.findUnique({ where: { email } })
    
    if (exists) throw new AppError(409, 'Користувач з таким email вже існує')
  
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hash } })

    return reply.code(201).send({ id: user.id, email: user.email })
  })

  // POST /api/auth/login → 200 { token }
  app.post('/api/auth/login', async (req) => {
    const { email, password } = credentialsSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })

    const valid = user ? await bcrypt.compare(password, user.password) : false
    if (!user || !valid) {
      throw new AppError(401, 'Неправильний email або пароль')
    }

    const token = app.jwt.sign({ id: user.id, email: user.email, role: user.role})

    return { token }
  })

  // GET /api/auth/me → хто я зараз. Клієнту на Пз5 це знадобиться,
  // щоб показати email у шапці, не розбираючи токен руками.
  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (req) => req.user)
}
