import { Navigate, useLocation } from 'react-router-dom'
import { sessionService } from '../../services/api'

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation()
  const token = sessionService.getToken()
  const role = sessionService.getRole()

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
