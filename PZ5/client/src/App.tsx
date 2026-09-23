import { getToken } from './api/client'
import LoginPage from './pages/LoginPage'
import NotesListPage from './pages/NotesListPage'

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
  const authed = Boolean(getToken())
  return (
    <main className="app">
      <header className="header">
        <h1>Мій проєкт</h1>
      </header>
      {authed ? <NotesListPage /> : <LoginPage onSuccess={() => {}} />}
    </main>
  )
}
