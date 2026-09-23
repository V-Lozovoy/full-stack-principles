import { Navigate, Outlet } from 'react-router-dom'

import { useSession } from '../store/session'

/**
 * Сім рядків на весь захист клієнта.
 *
 * І одразу застереження: це зручність, а не безпека. Справжній захист
 * лишається на сервері — preHandler і where з Л4. Той, хто хоче ваші дані,
 * не відкриває ваш React, а стукає в API напряму через curl.
 */
export default function ProtectedRoute() {
  const token = useSession((s) => s.token)
  // replace — щоб «назад» не повертало у захищену зону
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
