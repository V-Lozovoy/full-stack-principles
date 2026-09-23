import type { FieldError } from '../types'

const TOKEN_KEY = 'token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** Помилка з сервера у вигляді, зручному для форми. */
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

// TODO(1) [Пз5 · Л5, «Одна обгортка над fetch», «Помилка доходить до поля», «401 — це вихід»]: одна обгортка над fetch на весь клієнт.
//
// Це найважливіший файл практичної. fetch, розкиданий по компонентах,
// знімає бали: тоді токен, базовий шлях і розбір помилок доводиться
// повторювати в кожному екрані — і десь неодмінно забути.
//
// Що має робити api<T>(path, options):
//
//   1. Заголовки:
//        Content-Type: application/json — ЛИШЕ коли є тіло. На порожньому
//        GET Fastify спробує розпарсити JSON і відповість 400.
//        Authorization: Bearer <token> — якщо токен є.
//
//   2. fetch(`/api${path}`, ...) — саме /api, решту зробить проксі Vite.
//
//   3. fetch НЕ кидає помилку на 404 і 500. Перевіряйте res.ok самі,
//      інакше catch у компоненті ніколи не спрацює.
//
//   4. На помилці: прочитати { error, details } і кинути ApiError.
//      details приходить із мережі — довіряти його формі не можна,
//      тому відфільтруйте все, що не { field, message }.
//
//   5. 401 обробляє ЦЕЙ шар, а не компоненти: чистимо токен і йдемо на
//      /login. Виняток — сама форма входу: там токена ще немає, і 401
//      означає «невірний пароль». Перевірка `if (!getToken()) return`.
//
//   6. 204 No Content: тіла немає, і res.json() на ньому впаде.
//
// Як видно, що не зроблено: жоден екран не показує даних.

export async function api<T>(_path: string, _options: RequestInit = {}): Promise<T> {
  throw new Error('TODO(1): напишіть обгортку над fetch')
}
