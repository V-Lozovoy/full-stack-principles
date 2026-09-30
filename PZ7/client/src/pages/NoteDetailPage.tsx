import { Link, useNavigate, useParams } from 'react-router-dom'

import { useDeleteNote, useNote } from '../hooks/useNotes'

export default function NoteDetailPage() {
  // Параметр маршруту завжди рядок — перетворюємо на число самі.
  const { id } = useParams<{ id: string }>()
  const noteId = Number(id)
  const navigate = useNavigate()

  const { data: note, isPending, isError, error } = useNote(noteId)
  const remove = useDeleteNote()

  if (isPending) return <p>Завантаження…</p>
  if (isError) {
    return (
      <p className="error" role="alert">
        {error instanceof Error ? error.message : 'Помилка'}
      </p>
    )
  }

  return (
    <article className="card">
      <h2>{note.title}</h2>
      {note.text && <p>{note.text}</p>}
      <p className="meta">
        {note.lat.toFixed(4)}, {note.lng.toFixed(4)} ·{' '}
        {new Date(note.createdAt).toLocaleDateString('uk')}
      </p>
      <div className="row">
        <Link to="/">← До списку</Link>
        <button
          className="danger"
          disabled={remove.isPending}
          onClick={() => remove.mutate(note.id, { onSuccess: () => navigate('/') })}
        >
          Видалити
        </button>
      </div>
    </article>
  )
}
