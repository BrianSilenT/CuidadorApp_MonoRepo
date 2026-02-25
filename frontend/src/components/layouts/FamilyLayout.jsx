import Sidebar from '../common/Sidebar'
import { useLocation } from 'react-router-dom'

export default function FamilyLayout({ children, title }) {
  const location = useLocation()
  const menuItems = [
    { icon: 'dashboard', label: 'Agenda y Reservas', path: '/family/dashboard' },
    { icon: 'medical_information', label: 'Historial Médico', path: '/family/medical-records' },
    { icon: 'history', label: 'Historial', path: '/family/history' },
    { icon: 'support_agent', label: 'Soporte', path: '/family/support' }
  ]
  const activeMenuTitle = menuItems.find((item) => item.path === location.pathname)?.label
  const headerTitle = title || activeMenuTitle || 'Portal Familiar'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar title="CuidadorApp" subtitle="Familia: John Doe" menuItems={menuItems} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#f6f7f8]">
        <header className="h-16 border-b border-[#e7edf3] bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">{headerTitle}</h2>
        </header>
        {children}
      </main>
    </div>
  )
}
