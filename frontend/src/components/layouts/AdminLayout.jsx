import Sidebar from '../common/Sidebar'
import { useLocation } from 'react-router-dom'

export default function AdminLayout({ children, title }) {
  const location = useLocation()
  const menuItems = [
    { icon: 'dashboard', label: 'Resumen', path: '/admin/dashboard' },
    { icon: 'groups', label: 'Pacientes', path: '/admin/pacientes' },
    { icon: 'medical_services', label: 'Cuidadores', path: '/admin/cuidadores' },
    { icon: 'schedule', label: 'Turnos', path: '/admin/guardias' },
    { icon: 'description', label: 'Reportes', path: '/admin/reportes' },
    { icon: 'payments', label: 'Pagos', path: '/admin/pagos' }
  ]
  const activeMenuTitle = menuItems.find((item) => item.path === location.pathname)?.label
  const headerTitle = title || activeMenuTitle || 'Panel de Administración'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar title="CuidadorApp" subtitle="Administración" menuItems={menuItems} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#f6f7f8]">
        <header className="h-16 border-b border-[#e7edf3] bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">{headerTitle}</h2>
        </header>
        {children}
      </main>
    </div>
  )
}
