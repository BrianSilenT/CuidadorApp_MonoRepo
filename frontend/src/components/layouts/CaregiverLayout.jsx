import Sidebar from '../common/Sidebar'
import { useLocation } from 'react-router-dom'

export default function CaregiverLayout({ children, title }) {
  const location = useLocation()
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar title="CuidadorApp" subtitle="Portal de Cuidadores" menuItems={menuItems} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#f6f7f8]">
        <header className="h-16 border-b border-[#e7edf3] bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">{headerTitle}</h2>
        </header>
        {children}
      </main>
    </div>
  )
}
