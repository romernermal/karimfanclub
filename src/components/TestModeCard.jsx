export default function TestModeCard({ mode, icon, title, description, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  )
}
