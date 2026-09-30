import { useParams, useNavigate } from 'react-router-dom'
import { useDeleteNote, useNote } from '../hooks/useNotes'

/**
 * Заготовка для кроку 2 (маршрути): сторінка однієї нотатки за адресою
 * /notes/:id. Параметр :id уже читається - і пам'ятайте: він приходить
 * РЯДКОМ, тому перетворюйте на число самі: const noteId = Number(id).
 *
 * TODO (після кроку 4): дані через useNote(noteId) і ті самі чотири
 * екрани, що й у списку: завантаження / помилка / порожньо / нотатка.
 * Плюс видалення: useDeleteNote() і перехід на список після успіху.
 */
export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const noteId = Number(id)
  const navigate = useNavigate()
  const { data: note, isPending, error } = useNote(noteId)
  const remove = useDeleteNote()

  if (isPending) return <p>Завантаження...</p>

  if (!note) {
    return (
      <p className="error" role="alert">{error?.message ?? 'Нотатку не знайдено'}</p>
    )
  }

  return (
    <article className="card">
      <h2>{note.title}</h2>
      {note.text && <p>{note.text}</p>}
      <p className="meta">{note.lat.toFixed(4)}, {note.lng.toFixed(4)}</p>

      <button className="danger" disabled={remove.isPending} onClick={
        () => remove.mutate(note.id, { onSuccess: () => navigate('/notes') })}>
      Видалити
      </button>
    </article>
  )
}
