import { useLocation } from 'react-router-dom'
import RoleLayout from './RoleLayout'
import useLogout from '../../hooks/useLogout'

export default function FamilyLayout({ children, title }) {
  const location = useLocation()
  const logout = useLogout('/family/login')
  const menuItems = [
    { icon: 'dashboard', label: 'Agenda y Reservas', path: '/family/dashboard' },
    { icon: 'medical_information', label: 'Historial Médico', path: '/family/medical-records' },
    { icon: 'history', label: 'Historial', path: '/family/history' },
    { icon: 'support_agent', label: 'Soporte', path: '/family/support' }
  ]
  const activeMenuTitle = menuItems.find((item) => item.path === location.pathname)?.label
  const headerTitle = title || activeMenuTitle || 'Portal Familiar'

  return (
    <RoleLayout
      title={title}
      headerTitle={headerTitle}
      sidebarTitle="CuidadorApp"
      sidebarSubtitle="Portal Familiar"
      menuItems={menuItems}
      onLogout={logout}
    >
      {children}
    </RoleLayout>
  )
}
