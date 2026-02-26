export default function DualPanel({ show = false, left = null, right = null }) {
  if (!show) return null

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {left}
      {right}
    </div>
  )
}
