export default function Card({ children, className = '', hover = false }) {
  const hoverClass = hover ? 'transition-all hover:shadow-xl hover:border-[#2b8cee]' : ''
  
  return (
    <div className={`bg-white rounded-xl border border-[#e7edf3] shadow-sm p-6 ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}
