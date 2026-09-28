import { getToken, setToken } from './api/client'
import LoginPage from './pages/LoginPage'
import NotesListPage from './pages/NotesListPage'
import { useState } from 'react'


// TODO(5) [Пз5 · Л5, «Дерево компонентів: дані вниз, події вгору»]: зібрати екрани докупи.
//
// На Пз5 «маршрутизація» — це один тернарник по наявності токена.
// На Пз6 замість нього зʼявиться React Router з адресами та історією.
//
//   • стан authed: useState(() => Boolean(getToken()))
//   • є токен → <NotesListPage />, немає → <LoginPage onSuccess={...} />
//   • кнопка «Вийти»: setToken(null) і назад на форму.
//
// Стан живе тут, а не в картці: це називають «підняти стан».

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()))

  function handleLogout() {
    setToken(null)
    setAuthed(false)
  }
  return (
    <main className="app">
      <header className="header">
        <h1>Мій проєкт (Басараб, КН-25м)</h1>
        {authed && (
          <button type='button' className='link' onClick={handleLogout}>Вийти</button>
        )}
      </header>
      {authed ? <NotesListPage /> : <LoginPage onSuccess={() => {}} />}
    </main>
  )
}
