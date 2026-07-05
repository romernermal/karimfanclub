export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500">
          Question {current + 1} of {total}
        </span>
        <span className="text-xs font-medium text-gray-500">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
