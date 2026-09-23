import { useEffect, useState } from 'react'

import { api } from '../api/client'
import NoteCard from '../components/NoteCard'
import type { Note, Page } from '../types'

/**
 * Один запит — чотири екрани:
 *
 *   notes === null   → «Завантаження…»  («ще не знаю»)
 *   error !== null   → текст помилки і кнопка «Повторити»
 *   notes.length = 0 → «Поки що порожньо» (це вже ВІДПОВІДЬ сервера)
 *   notes.length > 0 → картки
 *
 * Порожній список — не завантаження. Розділяти ці два стани — прямий
 * критерій Пз5: коли вони злиті, зламаний запит і порожня база на екрані
 * виглядають однаково.
 */
export default function NotesListPage() {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function load() {
    setError(null)
    try {
      const page = await api<Page<Note>>('/notes')
      setNotes(page.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити')
    }
  }

  // [] у залежностях — рівно один раз після появи компонента.
  // У dev спрацює двічі: це StrictMode, а не баг.
  useEffect(() => {
    void load()
  }, [])

  async function onVisit(note: Note) {
    if (pendingId !== null) return // другий клік просто ігноруємо
    setPendingId(note.id)
    try {
      await api(`/notes/${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ visited: !note.visited }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося оновити')
    } finally {
      setPendingId(null)
    }
  }

  async function onDelete(note: Note) {
    if (pendingId !== null) return
    setPendingId(note.id)
    try {
      await api(`/notes/${note.id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося видалити')
    } finally {
      setPendingId(null)
    }
  }

  if (error) {
    return (
      <div className="card">
        <p className="error" role="alert">
          {error}
        </p>
        <button onClick={() => void load()}>Повторити</button>
      </div>
    )
  }

  if (notes === null) return <p>Завантаження…</p>
  if (notes.length === 0) return <p>Поки що порожньо. Створіть першу нотатку.</p>

  return (
    <div className="list">
      {notes.map((note) => (
        // key — стабільний id з даних, а не індекс масиву
        <NoteCard
          key={note.id}
          note={note}
          onVisit={onVisit}
          onDelete={onDelete}
          busy={pendingId === note.id}
        />
      ))}
    </div>
  )
}
