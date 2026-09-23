// Конфігурація Prisma 7. З версії 7 рядок підключення живе тут, а не
// в schema.prisma: схема описує форму даних, конфіг — де ця база стоїть.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // npx prisma db seed
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
