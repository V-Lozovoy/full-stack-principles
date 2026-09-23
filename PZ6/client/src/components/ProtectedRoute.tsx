// Друга половина TODO(2) [Пз6 · Л6, «Захищений маршрут і два провайдери»]:
// захищений маршрут. Сім рядків на весь захист клієнта.
//
//   import { Navigate, Outlet } from 'react-router-dom'
//   import { useSession } from '../store/session'
//
//   export default function ProtectedRoute() {
//     const token = useSession((s) => s.token)
//     return token ? <Outlet /> : <Navigate to="/login" replace />
//   }
//
// replace обовʼязковий: без нього «назад» поверне користувача у захищену зону.
//
// І застереження, яке я питатиму на захисті: це ЗРУЧНІСТЬ, а не безпека.
// Справжній захист лишається на сервері — preHandler і where з Л4. Той, хто
// хоче ваші дані, не відкриває ваш React, а стукає в API через curl.
//
// Як видно, що не зроблено: приватна вкладка відкриває список без входу.

export default function ProtectedRoute() {
  return null
}
