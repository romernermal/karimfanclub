import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useQuizStore from '../stores/quizStore'
import { gradeAnswer, getCorrectAnswerText } from '../utils/grading'
import ProgressBar from '../components/ProgressBar'
import MCQInput from '../components/MCQInput'
import TextInput from '../components/TextInput'
import FlashCard from '../components/FlashCard'

export default function Quiz() {
  const { subjectId, testId } = useParams()
  const navigate = useNavigate()

  const {
    currentMode,
    testsCache,
    currentQuestionIndex,
    quizComplete,
    userAnswers,
    answerQuestion,
    nextQuestion,
    questionOrder,
    initQuestionOrder,
    isMasterQuiz,
    masterQuizData,
  } = useQuizStore()

  const subjects = useQuizStore((s) => s.subjects)
  const loadTestData = useQuizStore((s) => s.loadTestData)
  const subject = subjects.find((s) => s.id === subjectId)
  const testMeta = subject?.tests.find((t) => t.id === testId)
  const testData = isMasterQuiz ? masterQuizData : testsCache[testId]
  const effectiveIndex = questionOrder.length > 0 ? questionOrder[currentQuestionIndex] : currentQuestionIndex
  const question = testData?.questions[effectiveIndex]
  const questionType = question?.type || testData?.testType
  const totalQuestions = testData?.questions.length || 0

  const [selectedOption, setSelectedOption] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [blanksAnswers, setBlanksAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const isFlashcards = currentMode === 'flashcards'
  const isNoMercy = currentMode === 'no-mercy'
  const isFriendly = currentMode === 'friendly'

  useEffect(() => {
    if (!currentMode) {
      navigate(`/subject/${subjectId}/test/${testId}/mode`, { replace: true })
      return
    }
    if (!testData && testMeta?.fileName) {
      loadTestData(testId, testMeta.fileName)
    }
  }, [])

  useEffect(() => {
      if (testData && testData.questions?.length > 0 && questionOrder.length === 0) {
        initQuestionOrder()
      }
    }, [testData])

  useEffect(() => {
    setSelectedOption(null)
    setTextAnswer('')
    setBlanksAnswers([])
    setSubmitted(false)
    setLastResult(null)
  }, [currentQuestionIndex])

  const correctAnswer = question
    ? getCorrectAnswerText(question, questionType)
    : ''

  const handleSubmit = useCallback(() => {
    if (!question || !testData) return

    let answer
    if (questionType === 'mcq') {
      answer = selectedOption
    } else if (questionType === 'identification') {
      answer = textAnswer
    } else if (questionType === 'fill_blanks') {
      answer = blanksAnswers
    }

    const isCorrect = gradeAnswer(question, answer, questionType)
    setLastResult(isCorrect)
    setSubmitted(true)
    answerQuestion(answer)
  }, [question, testData, selectedOption, textAnswer, blanksAnswers, answerQuestion])

  const handleNext = useCallback(() => {
    const isLast = currentQuestionIndex >= totalQuestions - 1
    nextQuestion()
    if (isLast) {
      navigate(`/subject/${subjectId}/test/${testId}/results`)
    }
  }, [currentQuestionIndex, totalQuestions, nextQuestion, navigate, subjectId, testId])

  const handleViewResults = useCallback(() => {
    navigate(`/subject/${subjectId}/test/${testId}/results`)
  }, [navigate, subjectId, testId])

  const canSubmit = () => {
    if (submitted || isFlashcards) return false
    if (questionType === 'mcq') return selectedOption !== null
    if (questionType === 'identification') return textAnswer.trim().length > 0
    if (questionType === 'fill_blanks') {
      return blanksAnswers.length > 0 && blanksAnswers.every((a) => a.trim().length > 0)
    }
    return false
  }

  const shouldShowNext = isFlashcards || submitted
  const showFeedback = submitted && (isFriendly || (isNoMercy && lastResult === false))

  if (!currentMode) {
    return null
  }

  if (!testData || !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const inNoMercyEarlyEnd = quizComplete && userAnswers.length > 0 &&
    !userAnswers[userAnswers.length - 1].isCorrect

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/subject/${subjectId}/test/${testId}/mode`)}
          className="flex items-center gap-1 text-sm text-gray-500 mb-4 min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Change Mode
        </button>

        <ProgressBar current={currentQuestionIndex} total={totalQuestions} />

        {isFlashcards ? (
          <div className="mt-6">
            <p className="text-center text-xs text-gray-400 mb-3">
              Card {currentQuestionIndex + 1} of {totalQuestions}
            </p>
            <FlashCard key={currentQuestionIndex} question={question} testType={questionType} />
          </div>
        ) : (
          <div key={currentQuestionIndex} className="animate-fade-in">
            <div className="mt-6 bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <p className="text-base sm:text-lg text-gray-900 leading-relaxed">
                {question.question}
              </p>
            </div>

            <div className="mt-5">
              {questionType === 'mcq' && (
                <MCQInput
                  options={question.options}
                  selected={selectedOption}
                  onSelect={setSelectedOption}
                  disabled={submitted}
                />
              )}
              {questionType === 'identification' && (
                <TextInput
                  value={textAnswer}
                  onChange={setTextAnswer}
                  disabled={submitted}
                  placeholder="Type your answer..."
                />
              )}
              {questionType === 'fill_blanks' && (
                <FillBlanksInput
                  question={question}
                  answers={blanksAnswers}
                  onChange={setBlanksAnswers}
                  disabled={submitted}
                />
              )}
            </div>
          </div>
        )}

        {showFeedback && (
          <div
            className={`mt-4 p-4 rounded-xl border-2 animate-fade-in ${
              lastResult
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p
              className={`font-semibold text-sm ${
                lastResult ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {lastResult ? 'Correct!' : 'Incorrect'}
            </p>
            {!lastResult && (
              <p className="text-sm text-gray-700 mt-1">
                The answer is: <span className="font-medium">{correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        {inNoMercyEarlyEnd && (
          <div className="mt-4 p-4 rounded-xl border-2 border-red-200 bg-red-50 animate-fade-in">
            <p className="font-semibold text-sm text-red-700">Test Ended</p>
            <p className="text-sm text-gray-700 mt-1">
              You got {userAnswers.filter((a) => a.isCorrect).length} correct
              before your first wrong answer.
            </p>
          </div>
        )}

        <div className="mt-6">
          {!shouldShowNext && !canSubmit() && !isFlashcards && (
            <button
              disabled
              className="w-full p-4 rounded-xl bg-gray-200 text-gray-400 font-semibold text-base cursor-not-allowed"
            >
              {questionType === 'mcq'
                ? 'Select an answer'
                : questionType === 'identification'
                  ? 'Type your answer'
                  : 'Fill in all blanks'}
            </button>
          )}

          {canSubmit() && (
            <button
              onClick={handleSubmit}
              className="w-full p-4 rounded-xl bg-emerald-600 text-white font-semibold text-base
                active:bg-emerald-700 transition-colors min-h-[52px]"
            >
              Submit Answer
            </button>
          )}

          {shouldShowNext && !quizComplete && (
            <button
              onClick={handleNext}
              className="w-full p-4 rounded-xl bg-blue-600 text-white font-semibold text-base
                active:bg-blue-700 transition-colors min-h-[52px]"
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
            </button>
          )}

          {quizComplete && (
            <button
              onClick={handleViewResults}
              className="w-full p-4 rounded-xl bg-violet-600 text-white font-semibold text-base
                active:bg-violet-700 transition-colors min-h-[52px]"
            >
              See Results
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function FillBlanksInput({ question, answers, onChange, disabled }) {
  const parts = question.question.split(/_{3,}|_____|____|___/g)

  function handleBlankChange(idx, value) {
    const next = [...answers]
    next[idx] = value
    onChange(next)
  }

  const blanks = question.answers || []

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-3">Fill in the blanks:</p>
      <div className="flex flex-wrap items-center gap-2">
        {parts.map((part, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {part && <span className="text-gray-900">{part}</span>}
            {idx < blanks.length && (
              <input
                type="text"
                value={answers[idx] || ''}
                onChange={(e) => handleBlankChange(idx, e.target.value)}
                disabled={disabled}
                className="w-24 p-2 border-b-2 border-blue-300 bg-blue-50 rounded text-center
                  text-gray-900 focus:outline-none focus:border-blue-500
                  disabled:opacity-60 disabled:cursor-not-allowed"
                autoComplete="off"
              />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
