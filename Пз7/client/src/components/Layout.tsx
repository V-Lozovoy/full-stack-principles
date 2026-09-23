import { Link, Outlet, useNavigate } from 'react-router-dom'

import { useSession } from '../store/session'

export default function Layout() {
  // Селектор: перемалюється лише той компонент, який читає саме це поле.
  const email = useSession((s) => s.email)
  const logout = useSession((s) => s.logout)
  const navigate = useNavigate()

  return (
    <main className="app">
      <header className="header">
        {/* <Link>, а не <a>: звичайне посилання перезавантажить сторінку */}
        <h1>
          <Link to="/">Нотатки на мапі</Link>
        </h1>
        <nav className="row">
          <Link to="/notes/new">Створити</Link>
          <span className="meta">{email}</span>
          <button
            className="link"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            Вийти
          </button>
        </nav>
      </header>
      <Outlet />
    </main>
  )
}
