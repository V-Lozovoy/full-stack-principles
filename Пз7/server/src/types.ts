// Спільні типи проєкту.
//
// З Пз3 типи сутностей більше не пишемо руками: Prisma генерує їх зі схеми.
// Одне джерело правди — schema.prisma; тут лишається тільки те, чого база
// не знає: формат службових відповідей API.

export type { Note, Tag, User } from './generated/prisma/client.js'

/** Відповідь GET /api/health. */
export type Health = {
  status: 'ok'
  uptime: number
}

/** Відповідь на список: не голий масив, а обгортка з лічильником. */
export type Page<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}
