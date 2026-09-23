import { useState } from 'react'

import { getToken, setToken } from './api/client'
import LoginPage from './pages/LoginPage'
import NotesListPage from './pages/NotesListPage'

// TODO(2) [Пз6 · Л6, «SPA: один index.html і маршрути в App.tsx»]: замінити тернарник
// на справжні маршрути. Цей же крок - і ProtectedRoute.tsx (друга половина,
// сім рядків у підказці того файла).
//
//   <Routes>
//     <Route path="/login" element={<LoginPage />} />
//     <Route element={<ProtectedRoute />}>      {/* обгортка: пускає або ні */}
//       <Route element={<Layout />}>            {/* обгортка: малює шапку */}
//         <Route index element={<MapPage />} />
//         <Route path="notes" element={<NotesListPage />} />
//         <Route path="notes/new" element={<NewNotePage />} />
//         <Route path="notes/:id" element={<NoteDetailPage />} />
//       </Route>
//     </Route>
//     <Route path="*" element={<p>404 — сторінку не знайдено</p>} />
//   </Routes>
//
// Заготовки всіх сторінок уже лежать у каркасі: components/Layout.tsx,
// pages/MapPage.tsx, NewNotePage.tsx і NoteDetailPage.tsx - імпортуйте
// їх сюди. Головна (index) - мапа, список переїжджає на /notes.
//
// Вкладені Route без path — це обгортки. Параметр :id читається через
// useParams() і приходить РЯДКОМ. Переходи — <Link to>, з коду —
// useNavigate(). Звичайний <a> перезавантажить сторінку і зітре стан.
//
// F5 на /notes/3 має відкривати ту саму сторінку: у деві це робить Vite,
// у проді — try_files у nginx (Л7).
//
// Як видно, що не зроблено: адреса в рядку браузера не змінюється.
export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()))

  return (
    <main className="app">
      <header className="header">
        <h1>Нотатки на мапі</h1>
        {authed && (
          <button
            className="link"
            onClick={() => {
              setToken(null)
              setAuthed(false)
            }}
          >
            Вийти
          </button>
        )}
      </header>

      {authed ? <NotesListPage /> : <LoginPage onSuccess={() => setAuthed(true)} />}
    </main>
  )
}
