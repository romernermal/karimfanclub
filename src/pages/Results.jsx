import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useQuizStore from '../stores/quizStore'
import AnswerKey from '../components/AnswerKey'

export default function Results() {
  const { subjectId, testId } = useParams()
  const navigate = useNavigate()
  const [showAnswers, setShowAnswers] = useState(false)

  const userAnswers = useQuizStore((s) => s.userAnswers)
  const testsCache = useQuizStore((s) => s.testsCache)
  const currentMode = useQuizStore((s) => s.currentMode)
  const currentSubjectId = useQuizStore((s) => s.currentSubjectId)
  const currentTestId = useQuizStore((s) => s.currentTestId)
  const resetQuiz = useQuizStore((s) => s.resetQuiz)

  const isFlashcards = currentMode === 'flashcards'
  const testData = testsCache[testId]

  const totalQuestions = testData?.questions?.length || 0
  const score = userAnswers.filter((a) => a.isCorrect).length
  const total = totalQuestions
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  let gradeLabel = ''
  if (!isFlashcards) {
    if (percentage >= 90) gradeLabel = 'Excellent!'
    else if (percentage >= 70) gradeLabel = 'Good job!'
    else if (percentage >= 50) gradeLabel = 'Keep practicing.'
    else gradeLabel = 'Study more!'
  }

  function handleGoHome() {
    resetQuiz()
    navigate('/')
  }

  function handleRetry() {
    navigate(`/subject/${subjectId}/test/${testId}/mode`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center">
          {isFlashcards ? (
            <>
              <span className="text-5xl">🃏</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                Study Complete
              </h1>
              <p className="text-gray-500 mt-2">
                You reviewed {total} card{total !== 1 ? 's' : ''}.
              </p>
            </>
          ) : (
            <>
              <span className="text-5xl">🎯</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                {gradeLabel}
              </h1>
              <div className="mt-6">
                <span className="text-5xl font-bold text-blue-600">
                  {score}
                </span>
                <span className="text-2xl text-gray-400">/{total}</span>
              </div>
              <p className="text-3xl font-semibold text-gray-700 mt-2">
                {percentage}%
              </p>
              {currentMode === 'no-mercy' && (
                <p className="text-sm text-gray-500 mt-2">
                  You attempted {userAnswers.length} of {total} questions.
                </p>
              )}
            </>
          )}
        </div>

        {!isFlashcards && userAnswers.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowAnswers((v) => !v)}
              className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900
                font-semibold text-base active:scale-[0.98] transition-transform min-h-[52px]"
            >
              {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
            </button>

            {showAnswers && (
              <AnswerKey userAnswers={userAnswers} test={testData} />
            )}
          </div>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={handleRetry}
            className="w-full p-4 rounded-xl bg-blue-600 text-white font-semibold text-base
              active:bg-blue-700 transition-colors min-h-[52px]"
          >
            {isFlashcards ? 'Study Again' : 'Try Again'}
          </button>
          <button
            onClick={handleGoHome}
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700
              font-semibold text-base active:scale-[0.98] transition-transform min-h-[52px]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
