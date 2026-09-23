import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiError } from '../api/client'
import { useCreateNote } from '../hooks/useNotes'

export default function NewNotePage() {
  const [title, setTitle] = useState('')
  const [lat, setLat] = useState('48.4647')
  const [lng, setLng] = useState('35.0462')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const create = useCreateNote()
  const navigate = useNavigate()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})
    create.mutate(
      { title, lat: Number(lat), lng: Number(lng) },
      {
        // Список оновиться сам: invalidateQueries у хуку.
        // Ручного перечитування тут немає і бути не повинно.
        onSuccess: () => navigate('/'),
        onError: (err) => setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {}),
      },
    )
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Нова нотатка</h2>

      <label>
        Назва
        <input
          value={title}
          required
          aria-invalid={Boolean(fieldErrors.title)}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}

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
      {fieldErrors.lat && <span className="field-error">{fieldErrors.lat}</span>}
      {fieldErrors.lng && <span className="field-error">{fieldErrors.lng}</span>}

      {create.isError && (
        <p className="error" role="alert">
          {create.error instanceof Error ? create.error.message : 'Помилка'}
        </p>
      )}

      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Зберігаю…' : 'Створити'}
      </button>
    </form>
  )
}
