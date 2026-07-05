import { useParams, useNavigate } from 'react-router-dom'
import useQuizStore from '../stores/quizStore'

export default function TestSelection() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const subjects = useQuizStore((s) => s.subjects)
  const subject = subjects.find((s) => s.id === subjectId)

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Subject not found.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 underline"
          >
            Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-500 mb-6 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6">{subject.name}</h1>

        <div className="space-y-3">
          {subject.tests.length > 1 && (
            <button
              onClick={() => navigate(`/subject/${subjectId}/test/__master__/mode`)}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 text-white text-left
                shadow-lg animate-shake transition-transform active:scale-[0.98] min-h-[72px]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-bold text-base">Master Quiz</p>
                  <p className="text-sm text-purple-100 mt-0.5">
                    Combine all {subject.tests.length} tests into one quiz
                  </p>
                </div>
              </div>
            </button>
          )}

          {subject.tests.map((test) => (
            <button
              key={test.id}
              onClick={() => navigate(`/subject/${subjectId}/test/${test.id}/mode`)}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 bg-white text-left
                transition-all active:scale-[0.98] hover:border-gray-300 min-h-[60px]"
            >
              <span className="text-gray-900 font-medium">{test.id}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
