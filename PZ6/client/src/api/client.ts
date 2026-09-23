import type { FieldError } from '../types'

const TOKEN_KEY = 'token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/**
 * Помилка з сервера у вигляді, зручному для форми.
 * `details` приходить із setErrorHandler на бекенді (Л2, «Помилки — в одному місці»).
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: FieldError[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /** { email: 'Некоректна пошта', password: 'Мінімум 8 символів' } */
  fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]))
  }
}

/** details приходить із мережі — довіряти його формі не можна. */
function parseDetails(raw: unknown): FieldError[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (d): d is FieldError =>
      typeof d === 'object' && d !== null &&
      typeof (d as FieldError).field === 'string' &&
      typeof (d as FieldError).message === 'string',
  )
}

/**
 * Токен протухає мовчки: він лишається у сховищі, тож користувач виглядає
 * «залогіненим», а кожен екран червоніє. 401 обробляє один шар — цей.
 * Жоден компонент не пише if (status === 401).
 */
function handleUnauthorized(): void {
  // На формі входу токена ще немає, і 401 там означає «невірний пароль».
  if (!getToken()) return
  setToken(null)
  if (location.pathname !== '/login') location.assign('/login')
}

/**
 * Єдина обгортка над fetch на весь клієнт.
 *
 * Тут — і токен, і базовий шлях, і розбір помилок. Тому жоден компонент
 * не знає, де лежить токен і як виглядає помилка сервера.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  // Content-Type лише коли є тіло: на порожньому GET Fastify спробує
  // розпарсити JSON і відповість 400.
  if (options.body) headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`/api${path}`, { ...options, headers })

  // fetch НЕ кидає помилку на 404 і 500 — перевіряємо res.ok самі,
  // інакше catch у компоненті ніколи не спрацює.
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: string; details?: unknown }
      | null
    if (res.status === 401) handleUnauthorized()
    throw new ApiError(
      res.status,
      body?.error ?? `Помилка ${res.status}`,
      parseDetails(body?.details),
    )
  }

  // 204 No Content — тіла немає, і res.json() на ньому впаде.
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
