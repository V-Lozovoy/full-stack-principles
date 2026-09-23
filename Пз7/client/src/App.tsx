import { Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import NewNotePage from './pages/NewNotePage'
import NoteDetailPage from './pages/NoteDetailPage'
import NotesListPage from './pages/NotesListPage'

/**
 * SPA: сервер віддає один index.html, далі маршрути малює JS. Перехід між
 * сторінками не смикає мережу; ціна — SEO треба вирішувати окремо.
 *
 * Порівняйте з Пз5: там був тернарник по токену. Тепер є адреси, історія
 * і кнопка «назад».
 *
 * Вкладені Route без path — це обгортки: ProtectedRoute пускає або ні,
 * Layout малює шапку.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<NotesListPage />} />
          <Route path="notes/new" element={<NewNotePage />} />
          <Route path="notes/:id" element={<NoteDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<p className="app">404 — сторінку не знайдено</p>} />
    </Routes>
  )
}
