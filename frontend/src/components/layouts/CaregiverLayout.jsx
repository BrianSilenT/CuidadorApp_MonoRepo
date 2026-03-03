import { useLocation } from 'react-router-dom'
import RoleLayout from './RoleLayout'
import useLogout from '../../hooks/useLogout'

export default function CaregiverLayout({ children, title }) {
  const location = useLocation()
  const logout = useLogout('/caregiver/login')
  const menuItems = [
    { icon: 'dashboard', label: 'Resumen', path: '/caregiver/dashboard' },
    { icon: 'description', label: 'Registros de Pacientes', path: '/caregiver/patient-logs' },
    { icon: 'warning', label: 'Incidencias', path: '/caregiver/incidents' },
    { icon: 'schedule', label: 'Reportes de Turno', path: '/caregiver/shift-reports' },
    { icon: 'payments', label: 'Pagos', path: '/caregiver/payroll' }
  ]
  const activeMenuTitle = menuItems.find((item) => item.path === location.pathname)?.label
  const headerTitle = title || activeMenuTitle || 'Portal de Cuidadores'

  return (
    <RoleLayout
      title={title}
      headerTitle={headerTitle}
      sidebarTitle="CuidadorApp"
      sidebarSubtitle="Portal de Cuidadores"
      menuItems={menuItems}
      onLogout={logout}
    >
      {children}
    </RoleLayout>
  )
}
