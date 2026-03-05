import { useNavigate } from 'react-router-dom'
import { authService, sessionService } from '../services/api'

export default function useLogout(loginPath) {
  const navigate = useNavigate()

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error)
      }
    } finally {
      sessionService.clear()
      navigate(loginPath, { replace: true })
    }
  }

  return logout
}
