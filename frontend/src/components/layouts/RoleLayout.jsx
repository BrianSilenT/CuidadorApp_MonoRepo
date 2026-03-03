import Sidebar from '../common/Sidebar'

export default function RoleLayout({ children, title, headerTitle, sidebarTitle, sidebarSubtitle, menuItems, onLogout }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar title={sidebarTitle} subtitle={sidebarSubtitle} menuItems={menuItems} />
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#f6f7f8]">
        <header className="h-16 border-b border-[#e7edf3] bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">{title || headerTitle}</h2>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e7edf3] px-3 py-2 text-sm font-semibold text-[#0d141b] hover:bg-[#f6f7f8]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </header>
        {children}
      </main>
    </div>
  )
}
