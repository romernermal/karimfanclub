import { getCorrectAnswerText } from '../utils/grading'

export default function AnswerKey({ userAnswers, test }) {
  if (!test || !userAnswers?.length) return null

  return (
    <div className="space-y-3 mt-4">
      <h3 className="font-semibold text-gray-800 text-lg">Answer Key</h3>
      {userAnswers.map((item, idx) => {
        const question = test.questions.find(
          (q) => q.id === item.questionId
        )
        if (!question) return null

        const qType = question.type || test.testType
        const correctAnswer = getCorrectAnswerText(question, qType)
        const userAnswerText =
          qType === 'mcq'
            ? question.options[item.answer]
            : String(item.answer)

        return (
          <div
            key={item.questionId}
            className={`rounded-xl border-2 p-4 ${
              item.isCorrect
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p className="text-sm font-medium text-gray-900 mb-2">
              {idx + 1}. {question.question}
            </p>
            <div className="text-sm space-y-1">
              <p className={item.isCorrect ? 'text-green-700' : 'text-red-700'}>
                Your answer:{' '}
                <span className="font-medium">{userAnswerText}</span>
              </p>
              {!item.isCorrect && (
                <p className="text-green-700">
                  Correct answer:{' '}
                  <span className="font-medium">{correctAnswer}</span>
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
