import { Link, Outlet } from 'react-router-dom'

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
          {/* TODO (після кроку 1): email зі стора і кнопка «Вийти» */}
        </nav>
      </header>
      <Outlet />
    </main>
  )
}
