import { Link } from 'react-router-dom'

export default function PageHeader({
  title,
  description,
  breadcrumb = [],
  actionLabel,
  actionIcon,
  onAction
}) {
  return (
    <div className="bg-white border border-[#e7edf3] rounded-xl p-5 md:p-6">
      {breadcrumb.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 text-xs text-[#4c739a] mb-3">
          {breadcrumb.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.path ? (
                <Link to={item.path} className="hover:text-[#2b8cee]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#0d141b] font-semibold">{item.label}</span>
              )}
              {index < breadcrumb.length - 1 && (
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#0d141b]">{title}</h3>
          {description && <p className="text-sm text-[#4c739a] mt-1">{description}</p>}
        </div>

        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-2 rounded-lg h-10 px-4 bg-[#2b8cee] text-white text-sm font-bold hover:bg-[#2b8cee]/90"
          >
            {actionIcon && <span className="material-symbols-outlined text-[18px]">{actionIcon}</span>}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}