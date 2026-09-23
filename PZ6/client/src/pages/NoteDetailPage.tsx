import { useParams } from 'react-router-dom'

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

  return (
    <article className="card">
      <h2>Нотатка #{id}</h2>
      <p className="meta">Тут будуть дані нотатки - після кроку 4.</p>
    </article>
  )
}
