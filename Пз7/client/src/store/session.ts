import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  token: string | null
  email: string | null
  login: (token: string, email: string) => void
  logout: () => void
}

/**
 * Стор живе ПОЗА деревом React, тому дані з нього доступні і компонентам
 * (через селектор), і звичайним функціям (через getState) — наприклад,
 * обгортці над fetch, яка не є компонентом.
 *
 * У стор іде те, що читають у різних кутках застосунку: сесія, тема.
 * Усе, що потрібно одному піддереву, лишається пропсами.
 */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      login: (token, email) => set({ token, email }),
      logout: () => set({ token: null, email: null }),
    }),
    // persist серіалізує стан у localStorage і повертає його при старті:
    // саме тому сесія переживає F5. Свого коду для цього — нуль рядків.
    { name: 'session' },
  ),
)
