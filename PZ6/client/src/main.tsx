import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { ApiError } from './api/client'
import App from './App'
import './index.css'

/**
 * Дефолти TanStack Query, які студенти найчастіше приймають за баг застосунку:
 *   staleTime: 0            → дані «застарілі» одразу
 *   refetchOnWindowFocus    → повернувся у вкладку — тихий перезапит
 *   retry: 3                → будь-яка помилка повторюється тричі
 *
 * Цей файл у каркасі вже готовий — розберіть, що тут і навіщо (Л6,
 * «QueryClient не за замовчуванням»). Дефолти можна перевизначити
 * в кожному useQuery окремо — тут задаємо базу на весь застосунок.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Поки дані «свіжі», Query не ходить у мережу взагалі.
      staleTime: 30_000,
      // gcTime — це не staleTime: скільки кеш живе БЕЗ підписників.
      gcTime: 5 * 60_000,
      // Кінець «спливаючим даним» при поверненні у вкладку.
      refetchOnWindowFocus: false,
      // Повторювати 4xx марно: 401 уже обробила api(), 404 сам не зникне.
      retry: (n, error) => (error instanceof ApiError && error.status < 500 ? false : n < 1),
    },
    // Повтор POST дасть дубль.
    mutations: { retry: 0 },
  },
})

// Обидва провайдери обгортають усе рівно один раз. useQuery поза
// QueryClientProvider кине «No QueryClient set» — типова проблема Пз6.
//
// queryClient створюється ПОЗА компонентом: усередині він перестворювався б
// на кожному рендері, і кеш зникав би разом із ним.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

// StrictMode у dev навмисно викликає ефекти двічі — так React шукає ефекти,
// які не прибирають за собою. У прод-збірці цього немає.
