export function LoadingState({ label = 'Cargando información...' }) {
  return (
    <div className="text-center py-10 text-[#4c739a]">
      <span className="material-symbols-outlined animate-pulse text-3xl mb-2">hourglass_top</span>
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Ocurrió un error inesperado.' }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
      {message}
    </div>
  )
}

export function EmptyState({ label = 'No hay resultados para mostrar.' }) {
  return (
    <div className="text-center py-10 text-[#4c739a]">
      <span className="material-symbols-outlined text-3xl mb-2">inbox</span>
      <p className="text-sm">{label}</p>
    </div>
  )
}