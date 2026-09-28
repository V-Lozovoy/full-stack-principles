import { useEffect, useState } from 'react'
import { api } from '../api/client'
import NoteCard from '../components/NoteCard'
import type { Note, Page } from '../types'

// TODO(4) [Пз5 · Л5, «NotesListPage: один запит і чотири екрани»]: сторінка-список і чотири екрани одного запиту.
//
//   notes === null    → «Завантаження…»           («ще не знаю»)
//   error !== null    → текст помилки + «Повторити»
//   notes.length === 0 → «Поки що порожньо»        (це вже ВІДПОВІДЬ сервера)
//   notes.length > 0  → картки
//
// Порожній список — НЕ завантаження. Розділяти ці два стани — прямий
// критерій Пз5: коли вони злиті, зламаний запит і порожня база на екрані
// виглядають однаково. Перевірятиму, вимикаючи ваш сервер і чистячи базу.
//
//   • useEffect(() => { load() }, []) — рівно один раз після появи
//     компонента. У dev спрацює двічі: це StrictMode, а не баг.
//   • Відповідь сервера — { items, total, page, limit }, не голий масив.
//   • key={note.id} у списку — стабільний id з даних, НЕ індекс масиву.
//   • pendingId: поки летить запит однієї картки, вимкнена саме вона,
//     а не весь список.
//
// Як видно, що не зроблено: після входу екран порожній.

export default function NotesListPage() {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function load() {
    setError(null)
    setNotes(null)
    try {
      const page = await api<Page<Note>>('/notes')
      setNotes(page.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося завантажити записи')
    }
  }

  useEffect(() => { load() }, [])

  async function handleVisit(note: Note) {
    setPendingId(note.id)
    setActionError(null)
    try {
      const updated = await api<Note>(`/notes/${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ visited: !note.visited })
      })

      setNotes((prev) => prev && prev.map(
        (n) => (n.id === note.id ? { ...n, visited: updated.visited } : n)),
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не вдалося оновити запис')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete(note: Note) {
    setPendingId(note.id)
    setActionError(null)
    try {
      await api<void>(`/notes/${note.id}`, { method: 'DELETE' })
      setNotes((prev) => prev && prev.filter((n) => n.id !== note.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не вдалося видалити запис')
    } finally {
      setPendingId(null)
    }
  }

  if (error !== null) {
    return (
      <div className='list'>
        <p className='error' role='alert'>{error}</p>
        <div className='row'>
          <button type='button' onClick={load}>Повторити</button>
        </div>
      </div>
    )
  }

  if (notes === null) {
    return <p>Завантаження...</p>
  }

  if (notes.length === 0) {
    return <p>Поки що порожньо</p>
  }

  return (
    <div className='list'>
      {actionError && (
        <p className='error' role='alert'>{actionError}</p>
      )}
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          busy={pendingId === note.id}
          onVisit={handleVisit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
