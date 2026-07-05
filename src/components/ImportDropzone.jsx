import { useRef, useState } from 'react'
import useQuizStore from '../stores/quizStore'

export default function ImportDropzone() {
  const inputRef = useRef(null)
  const importFile = useQuizStore((s) => s.importFile)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function handleFile(file) {
    setError(null)
    setSuccess(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        importFile(data)
        setSuccess('Imported successfully!')
      } catch {
        setError('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function onDragLeave() {
    setDragOver(false)
  }

  return (
    <div className="mt-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors min-h-[120px] flex flex-col items-center justify-center ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <svg
          className="w-10 h-10 mx-auto mb-2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-500">
          Tap to browse or drag a JSON file here
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
      {success && (
        <p className="mt-2 text-sm text-green-600 text-center">{success}</p>
      )}
    </div>
  )
}
