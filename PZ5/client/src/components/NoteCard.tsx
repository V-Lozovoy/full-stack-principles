import type { Note } from '../types'

interface Props {
  note: Note
  onVisit: (note: Note) => void
  onDelete: (note: Note) => void
  /** Поки запит саме цієї картки в польоті — кнопки вимкнені. */
  busy?: boolean
}

// TODO(2) [Пз5 · Л5, «Перший компонент: NoteCard»]: картка одного запису.
//
// Правило, за яким перевірятиму: картка НЕ ходить в API сама. Вона отримує
// дані пропсом і кличе onVisit / onDelete, які їй передали. Дані вниз,
// події вгору — тоді ту саму картку можна показати будь-де і перевірити
// без сервера.
//
// Що всередині:
//   • заголовок і поля вашого запису;
//   • {note.text && <p>…</p>} — умовний рендер: немає тексту, немає абзацу;
//   • кнопка, підпис якої залежить від стану ({note.visited ? … : …});
//   • disabled={busy} на кнопках — інакше подвійний клік надішле два запити,
//     і другий буде із застарілими даними.
//
// Як видно, що не зроблено: список порожній, хоча дані з сервера прийшли.

export default function NoteCard({ note, onVisit, onDelete, busy = false }: Props) {
  const tags = note.tags?.map((tag) => `#${tag.name}`).join(' ')

  return (
    <article className="card">
      <h3>{note.title}</h3>
      <p className="meta">
        {note.lat}, {note.lng} {tags ? ` ${tags}` : ''}
      </p>
      {note.text && <p>{note.text}</p>}
      <div className="row">
        <button type="button" onClick={() => onVisit(note)} disabled={busy}>
          {note.visited ? 'Відвідано' : 'Відзначити відвіданим'}
        </button>
        <button type="button" className="danger" onClick={() => onDelete(note)} disabled={busy}>Видалити</button>
      </div>
    </article>
  )
}
