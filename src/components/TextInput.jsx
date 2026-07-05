export default function TextInput({ value, onChange, disabled, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder || 'Type your answer...'}
      className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-lg
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
        disabled:opacity-60 disabled:cursor-not-allowed"
      autoComplete="off"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !disabled) {
          e.target.blur()
        }
      }}
    />
  )
}
