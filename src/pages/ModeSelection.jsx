import { useParams, useNavigate } from 'react-router-dom'
import useQuizStore from '../stores/quizStore'
import TestModeCard from '../components/TestModeCard'

const MODES = [
  {
    id: 'normal',
    icon: '📝',
    title: 'Normal',
    description: 'Answer all questions, see your score at the end.',
  },
  {
    id: 'friendly',
    icon: '🎓',
    title: 'Friendly',
    description: 'Get immediate feedback after each question.',
  },
  {
    id: 'no-mercy',
    icon: '🔥',
    title: 'No Mercy',
    description: 'Ends immediately on the first wrong answer.',
  },
  {
    id: 'flashcards',
    icon: '🃏',
    title: 'Flashcards',
    description: 'Flip cards to reveal answers. No scoring.',
  },
]

export default function ModeSelection() {
  const { subjectId, testId } = useParams()
  const navigate = useNavigate()
  const startQuiz = useQuizStore((s) => s.startQuiz)
  const subjects = useQuizStore((s) => s.subjects)
  const loadTestData = useQuizStore((s) => s.loadTestData)

  const subject = subjects.find((s) => s.id === subjectId)
  const testMeta = subject?.tests.find((t) => t.id === testId)

  function handleSelect(modeId) {
    if (testMeta?.fileName) {
      loadTestData(testId, testMeta.fileName)
    }
    startQuiz(subjectId, testId, modeId)
    navigate(`/subject/${subjectId}/test/${testId}/quiz`)
  }

  if (!subject || !testMeta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Test not found.</p>
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
          onClick={() => navigate(`/subject/${subjectId}`)}
          className="flex items-center gap-1 text-sm text-gray-500 mb-6 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Choose Mode</h1>
        <p className="text-sm text-gray-500 mb-6">{testMeta.id}</p>

        <div className="space-y-3">
          {MODES.map((mode) => (
            <TestModeCard
              key={mode.id}
              {...mode}
              onClick={() => handleSelect(mode.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
