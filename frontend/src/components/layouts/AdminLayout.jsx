import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import RoleLayout from './RoleLayout'
import useLogout from '../../hooks/useLogout'
import { cuidadorService, unwrapList } from '../../services/api'

export default function AdminLayout({ children, title }) {
  const location = useLocation()
  const logout = useLogout('/admin/login')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const loadPending = async () => {
      try {
        const response = await cuidadorService.getAll()
        const rows = unwrapList(response.data)
        setPendingCount(rows.filter((item) => item.activo === false).length)
      } catch {
        setPendingCount(0)
      }
    }

    loadPending()
  }, [location.pathname])

  const menuItems = useMemo(() => [
    { icon: 'dashboard', label: 'Resumen', path: '/admin/dashboard' },
    { icon: 'groups', label: 'Pacientes', path: '/admin/pacientes' },
    { icon: 'medical_services', label: 'Cuidadores', path: '/admin/cuidadores' },
    { icon: 'person_add', label: 'Solicitudes', path: '/admin/solicitudes-cuidadores', badge: pendingCount },
    { icon: 'schedule', label: 'Turnos', path: '/admin/guardias' },
    { icon: 'description', label: 'Reportes', path: '/admin/reportes' },
    { icon: 'payments', label: 'Pagos', path: '/admin/pagos' }
  ], [pendingCount])
  const activeMenuTitle = menuItems.find((item) => item.path === location.pathname)?.label
  const headerTitle = title || activeMenuTitle || 'Panel de Administración'

  return (
    <RoleLayout
      title={title}
      headerTitle={headerTitle}
      sidebarTitle="CuidadorApp"
      sidebarSubtitle="Administración"
      menuItems={menuItems}
      onLogout={logout}
    >
      {children}
    </RoleLayout>
  )
}
