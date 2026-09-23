// Типи, які клієнт отримує від сервера.
//
// Джерело правди — schema.prisma на сервері. Тут копія, і вона має
// збігатися: розійдуться — і TypeScript про це не дізнається, бо через
// мережу приходить просто JSON.

export type Note = {
  id: number
  title: string
  text: string | null
  lat: number
  lng: number
  visited: boolean
  createdAt: string
  tags?: { name: string }[]
}

/** Відповідь списку: не голий масив, а обгортка з лічильником. */
export type Page<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

/** Розбивка помилки валідації по полях — з Л2, «Помилки — в одному місці». */
export type FieldError = { field: string; message: string }
