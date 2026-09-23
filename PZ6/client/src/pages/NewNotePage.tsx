import { useState } from 'react'

/**
 * Заготовка для кроку 2 (маршрути): сторінка створення нотатки за адресою
 * /notes/new. Форма вже керована - значення живуть у стані, а не в DOM.
 *
 * TODO (після кроку 4): збереження через useCreateNote() із hooks/useNotes.ts:
 *   const create = useCreateNote()
 *   const navigate = useNavigate()
 *   create.mutate({ title, lat: Number(lat), lng: Number(lng) },
 *     { onSuccess: () => navigate('/') })
 * Ручного перечитування списку тут немає і бути не повинно - список
 * оновить invalidateQueries усередині хука.
 */
export default function NewNotePage() {
  const [title, setTitle] = useState('')
  const [lat, setLat] = useState('48.4647')
  const [lng, setLng] = useState('35.0462')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    // TODO (після кроку 4): create.mutate({ title, lat: Number(lat), lng: Number(lng) }, ...)
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Нова нотатка</h2>

      <label>
        Назва
        <input value={title} required onChange={(e) => setTitle(e.target.value)} />
      </label>

      <div className="row">
        <label>
          Широта
          <input value={lat} onChange={(e) => setLat(e.target.value)} />
        </label>
        <label>
          Довгота
          <input value={lng} onChange={(e) => setLng(e.target.value)} />
        </label>
      </div>

      <button type="submit">Створити</button>
    </form>
  )
}
