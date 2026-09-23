import { Link } from 'react-router-dom'

import NoteCard from '../components/NoteCard'
import { useDeleteNote, useNotes, useUpdateNote } from '../hooks/useNotes'

/**
 * Порівняйте з Пз5: useEffect, useState і load() зникли повністю.
 * Ті самі чотири екрани — але писати їх уже не треба, вони приходять
 * із useQuery готовими.
 */
export default function NotesListPage() {
  const { data, isPending, isError, error, refetch } = useNotes()
  const update = useUpdateNote()
  const remove = useDeleteNote()

  if (isPending) return <p>Завантаження…</p>

  if (isError) {
    return (
      <div className="card">
        <p className="error" role="alert">
          {error instanceof Error ? error.message : 'Помилка'}
        </p>
        <button onClick={() => void refetch()}>Повторити</button>
      </div>
    )
  }

  if (data.items.length === 0) {
    return (
      <p>
        Поки що порожньо. <Link to="/notes/new">Створити першу</Link>.
      </p>
    )
  }

  return (
    <div className="list">
      {data.items.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onVisit={(n) => update.mutate({ id: n.id, patch: { visited: !n.visited } })}
          onDelete={(n) => remove.mutate(n.id)}
          // Тепер pendingId дає сам Query: variables — це те, з чим
          // мутацію викликали. Свого стану для «зайнято» не треба.
          busy={
            (update.isPending && update.variables?.id === note.id) ||
            (remove.isPending && remove.variables === note.id)
          }
        />
      ))}
    </div>
  )
}
