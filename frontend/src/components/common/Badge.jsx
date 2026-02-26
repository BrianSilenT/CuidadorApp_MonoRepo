export default function Badge({ children, variant = 'default', icon }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${variants[variant]}`}>
      {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
      {children}
    </span>
  )
}
