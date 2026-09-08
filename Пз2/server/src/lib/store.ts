import type { Note } from '../../../../Пз2/server/src/types.js'

/**
 * Сховище Пз2 — звичайний масив у памʼяті процесу.
 *
 * Це навмисно єдине місце, яке знає, ДЕ лежать дані. У Пз3 цей файл зникне,
 * а маршрути майже не зміняться: там, де зараз store.all(), буде
 * prisma.note.findMany(...). Якщо звертатися до масиву прямо з маршрутів,
 * переїзд у базу перетвориться на переписування всього.
 *
 * create() сам проставляє id, createdAt і значення за замовчуванням:
 * клієнт їх не надсилає, і схема валідації їх не чекає.
 */
let notes: Note[] = []
let nextId = 1

export const store = {
  all(): Note[] {
    return notes
  },

  byId(id: number): Note | undefined {
    return notes.find((n) => n.id === id)
  },

  create(data: Omit<Note, 'id' | 'createdAt' | 'visited'> & { visited?: boolean }): Note {
    const note: Note = {
      id: nextId++,
      visited: false,
      createdAt: new Date().toISOString(),
      ...data,
    }
    notes.push(note)
    return note
  },

  update(id: number, patch: Partial<Note>): Note | undefined {
    const note = store.byId(id)
    if (!note) return undefined
    Object.assign(note, patch)
    return note
  },

  remove(id: number): boolean {
    const before = notes.length
    notes = notes.filter((n) => n.id !== id)
    return notes.length !== before
  },
}
