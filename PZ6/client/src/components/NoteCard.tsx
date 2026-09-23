import type { Note } from '../types'

interface Props {
  note: Note
  onVisit: (note: Note) => void
  onDelete: (note: Note) => void
  /** Поки запит саме цієї картки в польоті — кнопки вимкнені. */
  busy?: boolean
}

/**
 * Компонент — функція від пропсів. Дані йдуть вниз, події — вгору:
 * картка нічого не змінює сама, вона кличе onVisit і onDelete.
 *
 * Картка не знає ні про API, ні про токен. Саме тому її легко показати
 * у будь-якому місці і легко перевірити (зірочка: тест на Vitest + RTL).
 */
export default function NoteCard({ note, onVisit, onDelete, busy = false }: Props) {
  return (
    <article className="card">
      <h3>{note.title}</h3>

      {/* && — умовний рендер: немає тексту, немає й абзацу */}
      {note.text && <p>{note.text}</p>}

      <p className="meta">
        {note.lat.toFixed(4)}, {note.lng.toFixed(4)}
        {note.tags?.length ? ' · ' + note.tags.map((t) => `#${t.name}`).join(' ') : ''}
      </p>

      <div className="row">
        <button onClick={() => onVisit(note)} disabled={busy}>
          {note.visited ? 'Відвідано' : 'Відзначити відвіданим'}
        </button>
        <button className="danger" onClick={() => onDelete(note)} disabled={busy}>
          Видалити
        </button>
      </div>
    </article>
  )
}
