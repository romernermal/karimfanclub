import { useState } from 'react'

export default function FlashCard({ question, testType }) {
  const [flipped, setFlipped] = useState(false)

  const type = question.type || testType

  const answerText =
    type === 'mcq'
      ? question.options[question.correctAnswer]
      : type === 'identification'
        ? question.answer
        : type === 'fill_blanks'
          ? question.answers.join(', ')
          : ''

  function handleClick() {
    setFlipped((f) => !f)
  }

  return (
    <div
      className="flip-card w-full max-w-md mx-auto"
      style={{ minHeight: '220px' }}
      onClick={handleClick}
    >
      <div
        className={`flip-card-inner ${flipped ? 'flipped' : ''}`}
        style={{ minHeight: '220px' }}
      >
        <div className="flip-card-front rounded-2xl bg-white border-2 border-gray-200 p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm">
          <p className="text-xs text-gray-400 mb-3">Tap to flip</p>
          <p className="text-lg text-gray-900 text-center leading-relaxed">
            {question.question}
          </p>
        </div>
        <div className="flip-card-back rounded-2xl bg-blue-50 border-2 border-blue-200 p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm">
          <p className="text-xs text-blue-400 mb-3">Answer</p>
          <p className="text-lg text-blue-900 text-center font-medium">
            {answerText}
          </p>
        </div>
      </div>
    </div>
  )
}
