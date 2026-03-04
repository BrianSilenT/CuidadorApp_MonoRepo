import Badge from './Badge'

export default function StatCard({ title, value, icon, trend, trendValue }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-[#e7edf3] shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-[#2b8cee]">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <Badge variant={trend === 'up' ? 'success' : 'error'} icon={`trending_${trend}`}>
            {trendValue}
          </Badge>
        )}
      </div>
      <p className="text-[#4c739a] text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  )
}
