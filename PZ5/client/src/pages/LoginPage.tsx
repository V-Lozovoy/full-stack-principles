import { useState, type SubmitEvent } from 'react'
import { api, ApiError, setToken } from '../api/client'

interface Props {
  onSuccess: () => void
}

// TODO(3) [Пз5 · Л5, «useState: керована форма входу» і «Помилка доходить до поля»]: форма входу і реєстрації.
//
//   • Керовані поля: value + onChange, значення живе у useState, не в DOM.
//     Забули onChange — поле не реагуватиме на введення.
//   • <form onSubmit={...}> і <button type="submit">, а не <div onClick>:
//     Enter, валідація браузера і скрінрідери працюють безкоштовно.
//   • Стан busy: кнопка вимкнена, поки летить запит.
//   • POST /auth/login → setToken(token) → onSuccess().
//     Перемикач «вхід / реєстрація» — спершу POST /auth/register.
//
//   • Помилки. Текст — той, що прийшов у полі error від сервера, а не
//     «щось пішло не так». Плюс розбивка по полях:
//         catch (err) {
//           setError(err instanceof Error ? err.message : '…')
//           setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {})
//         }
//     Критерій: під полем пароля має зʼявитися «Мінімум 8 символів»,
//     а не «Помилка 400» угорі. Додайте aria-invalid, щоб про помилку
//     дізнався і скрінрідер.
//
// Як видно, що не зроблено: увійти неможливо.

type Mode = 'login' | 'register'

export default function LoginPage({ onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setFieldErrors({})

    const body = JSON.stringify({ email, password })

    try {
      if (mode === 'register') {
        await api('/auth/register', { method: 'POST', body })
      }

      const { token } = await api<{ token: string }>('/auth/login', { method: 'POST', body })
      setToken(token)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося виконати запит')
      setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {})
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
    setFieldErrors({})
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{mode == 'login' ? 'Вхід' : 'Реєстрація'}</h2>

      <label>
        Email
        <input type="email" value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        autoComplete="email" 
        required
        aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
      </label>

      <label>
        Пароль
        <input type="password" value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        required
        aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
      </label>

      {error && (
        <p className="error" role="alert">{error}</p>
      )}

      <button type="submit" disabled={busy}>
        {busy ? 'Зачекайте...' : mode === 'login' ? 'Увійти' : 'Зареєструватися'}
      </button>

      <button type="button" className='link' onClick={switchMode} disabled={busy}>
        {mode === 'login' ? 'Немає аккаунта? Зареєструватися' : 'Вже є аккаунт? Увійти'}
      </button>
    </form>
  )
}