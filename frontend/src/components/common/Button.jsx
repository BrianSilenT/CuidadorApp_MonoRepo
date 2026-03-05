export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) {
  const baseStyles = 'flex items-center justify-center rounded-lg font-bold transition-all'
  
  const variants = {
    primary: 'bg-[#2b8cee] text-white hover:bg-[#2b8cee]/90',
    secondary: 'bg-[#e7edf3] text-[#0d141b] hover:bg-[#cfdbe7]',
    outline: 'border-2 border-[#2b8cee] text-[#2b8cee] hover:bg-[#2b8cee]/10'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-14 px-5 text-lg'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined mr-2">{icon}</span>}
      {children}
    </button>
  )
}
