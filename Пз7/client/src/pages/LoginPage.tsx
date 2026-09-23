import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { ApiError, api } from '../api/client'
import { useSession } from '../store/session'

export default function LoginPage() {
  const token = useSession((s) => s.token)
  const login = useSession((s) => s.login)
  const navigate = useNavigate()

  // Керовані поля: значення живе у стані, а не в DOM.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return // найдешевший захист від подвійного сабміту

    setBusy(true)
    setError(null)
    setFieldErrors({})

    try {
      if (mode === 'register') {
        await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
      }
      const { token: fresh } = await api<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      login(fresh, email)
      navigate('/', { replace: true })
    } catch (err) {
      // Текст помилки — той, що прийшов у полі error від сервера,
      // а не «щось пішло не так».
      setError(err instanceof Error ? err.message : 'Щось пішло не так')
      setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {})
    } finally {
      setBusy(false)
    }
  }

  // Ранній вихід — ПІСЛЯ всіх хуків, а не перед ними.
  // Хуки мають викликатися однакову кількість разів на кожному рендері;
  // return між ними дає «Rendered fewer hooks than expected» рівно тоді,
  // коли токен щойно зʼявився, а перехід ще не відбувся.
  if (token) return <Navigate to="/" replace />

  return (
    <form className="card form app" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Вхід' : 'Реєстрація'}</h2>

      <label>
        Пошта
        <input
          type="email"
          value={email}
          required
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}

      <label>
        Пароль
        <input
          type="password"
          value={password}
          required
          autoComplete="current-password"
          aria-invalid={Boolean(fieldErrors.password)}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy}>
        {busy ? 'Зачекайте…' : mode === 'login' ? 'Увійти' : 'Зареєструватись'}
      </button>

      <button
        type="button"
        className="link"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Немає акаунта? Зареєструватись' : 'Уже є акаунт? Увійти'}
      </button>
    </form>
  )
}
