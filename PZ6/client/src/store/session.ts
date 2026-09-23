// TODO(1) [Пз6 · Л6, «store/session.ts: стор на Zustand»]: стор сесії на Zustand.
//
//   import { create } from 'zustand'
//   import { persist } from 'zustand/middleware'
//
//   interface SessionState {
//     token: string | null
//     email: string | null
//     login: (token: string, email: string) => void
//     logout: () => void
//   }
//
//   export const useSession = create<SessionState>()(
//     persist((set) => ({ ... }), { name: 'session' }),
//   )
//
// Навіщо стор, якщо є пропси: він живе ПОЗА деревом React, тому дані з нього
// доступні і компонентам (селектор useSession(s => s.token)), і звичайним
// функціям (useSession.getState()) — наприклад, обгортці над fetch, яка
// компонентом не є. Саме через неї токен потрапляє в кожен запит.
//
// persist — те, завдяки чому сесія переживає F5. Свого коду нуль рядків.
//
// Стор НЕ замінює пропси: у нього йде лише те, що читають у різних кутках
// застосунку (сесія, тема). Усе, що потрібно одному піддереву, лишається пропсом.
//
// Другий крок: у api/client.ts замініть localStorage.getItem('token') на
// useSession.getState().token, а setToken(null) — на logout().
//
// Як видно, що не зроблено: після F5 вас викидає на форму входу.

export {}
