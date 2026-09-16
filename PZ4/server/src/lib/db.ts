import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client.js'

/**
 * Один клієнт на процес. Усередині нього — пул зʼєднань із базою, тому
 * створювати PrismaClient у кожному маршруті не можна: пули розмножаться
 * і Postgres швидко впреться в ліміт зʼєднань.
 *
 * З Prisma 7 клієнт не ходить у базу сам: за це відповідає драйвер-адаптер.
 * Для PostgreSQL це @prisma/adapter-pg — саме він тримає пул.
 */
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'Немає DATABASE_URL. Скопіюйте .env.example у .env: cp .env.example .env',
  )
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({
  adapter,
  // Розкоментуйте, щоб побачити кожен SQL-запит у консолі — так ловлять N+1.
  // log: ['query'],
})
