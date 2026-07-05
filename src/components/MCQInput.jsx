export default function MCQInput({ options, selected, onSelect, disabled }) {
  return (
    <div className="space-y-3">
      {options.map((opt, idx) => {
        const isSelected = selected === idx
        return (
          <button
            key={idx}
            onClick={() => !disabled && onSelect(idx)}
            disabled={disabled}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
              isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 text-sm font-medium mr-3 ${
              isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
            }`}>
              {String.fromCharCode(65 + idx)}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )
}
