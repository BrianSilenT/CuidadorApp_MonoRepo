export default function Input({ 
  label, 
  type = 'text', 
  placeholder,
  value,
  onChange,
  name,
  required = false,
  icon
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[#0d141b] text-sm font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c739a]">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full h-12 ${icon ? 'pl-12' : 'pl-4'} pr-4 border border-[#cfdbe7] rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/50`}
        />
      </div>
    </div>
  )
}
