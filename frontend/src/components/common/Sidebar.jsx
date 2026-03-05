import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ title, subtitle, menuItems = [] }) {
  const location = useLocation()
  const isRouteActive = (itemPath) => {
    if (location.pathname === itemPath) return true
    if (itemPath !== '/' && location.pathname.startsWith(`${itemPath}/`)) return true
    return false
  }
  
  return (
    <aside className="w-20 md:w-64 border-r border-[#e7edf3] bg-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-[#2b8cee] rounded-lg p-2 text-white">
          <span className="material-symbols-outlined block">health_and_safety</span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold leading-tight">{title}</h1>
          <p className="text-xs text-[#4c739a]">{subtitle}</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = isRouteActive(item.path)
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-[#2b8cee]/10 text-[#2b8cee]' 
                  : 'text-[#4c739a] hover:bg-[#e7edf3]'
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-sm hidden md:inline">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto hidden md:inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-[#2b8cee] text-white text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
