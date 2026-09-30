import NoteCard from '../components/NoteCard'
import type { Note } from '../types'
import { useDeleteNote, useNotes, useUpdateNote } from '../hooks/useNotes'

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
  const { data, isPending, isError, error, refetch } = useNotes()
  const update = useUpdateNote()
  const remove = useDeleteNote()

  function onVisit(note: Note) {
    if (update.isPending || remove.isPending) return // другий клік просто ігноруємо
    update.reset()
    remove.reset()
    update.mutate({ id: note.id, visited: !note.visited })
  }

  function onDelete(note: Note) {
    if (update.isPending || remove.isPending) return
    update.reset()
    remove.reset()
    remove.mutate(note.id)
  }

  function isBusy(note: Note): boolean {
    return (
      (update.isPending && update.variables?.id === note.id) ||
      (remove.isPending && remove.variables === note.id)
    )
  }

  if (isPending) return <p>Завантаження...</p>

  if (isError) {
    return (
      <div className="card">
        <p className="error" role="alert">{error.message}</p>
        <button onClick={() => void refetch()}>Повторити</button>
      </div>
    )
  }

  if (data.items.length === 0) return <p>Поки що порожньо</p>

  const mutationError = update.error ?? remove.error

  return (
    <>
      {mutationError && (
        <p className="error" role="alert">{mutationError.message}</p>
      )}
      <div className="list">
        {data.items.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onVisit={onVisit}
            onDelete={onDelete}
            busy={isBusy(note)}
          />
        ))}
      </div>
    </>
  )
}
