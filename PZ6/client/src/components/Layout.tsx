import { Link, Outlet } from 'react-router-dom'
import { useSession } from '../store/session'

/**
 * Заготовка для кроку 2 (маршрути): шапка, яка живе навколо <Outlet /> -
 * місця, куди Router малює поточну сторінку. Завдяки цьому шапка не
 * перемальовується при переходах.
 *
 * Після кроку 1 допишіть сюди вихід:
 *   const email = useSession((s) => s.email)
 *   const logout = useSession((s) => s.logout)
 * і на кнопці - logout() та повний перехід location.assign('/login'),
 * щоб заразом скинувся кеш Query (інакше наступний користувач може
 * побачити чужі дані).
 */
export default function Layout() {
  const email = useSession((s) => s.email)
  const logout = useSession((s) => s.logout)

  function onLogout() {
    logout()
    location.assign('/login')
  }

  return (
    <main className="app">
      <header className="header">
        <h1>
          {/* <Link>, а не <a>: звичайне посилання перезавантажить сторінку */}
          <Link to="/">Нотатки на мапі</Link>
        </h1>
        <nav className="row">
          <Link to="/">Мапа</Link>
          <Link to="/notes">Список</Link>
          <Link to="/notes/new">Створити</Link>
          {email && <span>{email}</span>}
          <button type='button' className='link' onClick={onLogout}>Вийти</button>
        </nav>
      </header>
      <Outlet />
    </main>
  )
}
