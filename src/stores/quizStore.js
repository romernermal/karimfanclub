import { create } from 'zustand'
import { gradeAnswer } from '../utils/grading'
import { saveToStorage, loadFromStorage } from '../utils/storage'

const DEFAULT_SUBJECTS_URL = './samples/subjects.json'

const useQuizStore = create((set, get) => ({
  subjects: [],
  testsCache: {},

  currentSubjectId: null,
  currentTestId: null,
  currentMode: null,

  shuffleEnabled: loadFromStorage('shuffle') === true,
  questionOrder: [],

  userAnswers: [],
  currentQuestionIndex: 0,
  quizComplete: false,

  setSubjects(subjects) {
    set({ subjects })
    saveToStorage('subjects', subjects)
  },

  addTestToCache(testId, testData) {
    const updated = { ...get().testsCache, [testId]: testData }
    set({ testsCache: updated })
    saveToStorage('testsCache', updated)
  },

  startQuiz(subjectId, testId, mode) {
    set({
      currentSubjectId: subjectId,
      currentTestId: testId,
      currentMode: mode,
      userAnswers: [],
      currentQuestionIndex: 0,
      quizComplete: false,
      questionOrder: [],
    })
  },

  setShuffleEnabled(enabled) {
    set({ shuffleEnabled: enabled })
    saveToStorage('shuffle', enabled)
  },

  initQuestionOrder() {
    const { currentTestId, testsCache, shuffleEnabled } = get()
    const test = testsCache[currentTestId]
    if (!test) return

    const count = test.questions.length
    const order = Array.from({ length: count }, (_, i) => i)

    if (shuffleEnabled) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]]
      }
    }

    set({ questionOrder: order })
  },

  answerQuestion(answer) {
    const { currentTestId, testsCache, currentQuestionIndex, currentMode, questionOrder } =
      get()
    const test = testsCache[currentTestId]
    if (!test) return

    const effectiveIndex = questionOrder.length > 0 ? questionOrder[currentQuestionIndex] : currentQuestionIndex
    const question = test.questions[effectiveIndex]
    const isCorrect = gradeAnswer(question, answer, test.testType)

    const result = { questionId: question.id, answer, isCorrect }
    const newResults = [...get().userAnswers, result]

    const updates = { userAnswers: newResults }

    if (!isCorrect && currentMode === 'no-mercy') {
      updates.quizComplete = true
    }

    set(updates)
  },

  nextQuestion() {
    const { currentTestId, testsCache, currentQuestionIndex } = get()
    const test = testsCache[currentTestId]
    if (!test) return

    if (currentQuestionIndex + 1 >= test.questions.length) {
      set({ quizComplete: true })
    } else {
      set({ currentQuestionIndex: currentQuestionIndex + 1 })
    }
  },

  resetQuiz() {
    set({
      currentSubjectId: null,
      currentTestId: null,
      currentMode: null,
      userAnswers: [],
      currentQuestionIndex: 0,
      quizComplete: false,
    })
  },

  async initSubjects() {
    const stored = loadFromStorage('subjects')
    if (stored) {
      set({ subjects: stored })
    } else {
      try {
        const res = await fetch(DEFAULT_SUBJECTS_URL)
        const data = await res.json()
        set({ subjects: data.subjects })
        saveToStorage('subjects', data.subjects)
      } catch {
        set({ subjects: [] })
      }
    }

    const cached = loadFromStorage('testsCache')
    if (cached) {
      set({ testsCache: cached })
    }
  },

  async loadTestData(testId, fileName) {
    if (get().testsCache[testId]) return

    const cached = loadFromStorage('testsCache')
    if (cached && cached[testId]) {
      set((state) => ({
        testsCache: { ...state.testsCache, [testId]: cached[testId] },
      }))
      return
    }

    try {
      const res = await fetch(`./samples/${fileName}`)
      const data = await res.json()
      get().addTestToCache(testId, data)
    } catch (err) {
      console.error(`Failed to load test: ${fileName}`, err)
    }
  },

  importFile(fileData) {
    if (fileData.subjects) {
      const existing = get().subjects
      const merged = [...existing]
      for (const subject of fileData.subjects) {
        const idx = merged.findIndex((s) => s.id === subject.id)
        if (idx >= 0) {
          const existingIds = merged[idx].tests.map((t) => t.id)
          const newTests = subject.tests.filter(
            (t) => !existingIds.includes(t.id)
          )
          merged[idx] = {
            ...merged[idx],
            tests: [...merged[idx].tests, ...newTests],
          }
        } else {
          merged.push(subject)
        }
      }
      set({ subjects: merged })
      saveToStorage('subjects', merged)
    } else if (fileData.testType) {
      const testId = fileData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      get().addTestToCache(testId, fileData)

      const subjectName = fileData.title.split(/[-–—]/)[0].trim()
      const subjectId = subjectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const existing = get().subjects
      const subjIdx = existing.findIndex((s) => s.id === subjectId)

      if (subjIdx >= 0) {
        if (!existing[subjIdx].tests.some((t) => t.id === testId)) {
          const updated = [...existing]
          updated[subjIdx] = {
            ...updated[subjIdx],
            tests: [
              ...updated[subjIdx].tests,
              { id: testId, fileName: '' },
            ],
          }
          set({ subjects: updated })
          saveToStorage('subjects', updated)
        }
      } else {
        set({
          subjects: [
            ...existing,
            {
              id: subjectId,
              name: subjectName,
              tests: [{ id: testId, fileName: '' }],
            },
          ],
        })
        saveToStorage('subjects', get().subjects)
      }
    } else if (fileData.id && fileData.tests) {
      const existing = get().subjects
      if (!existing.some((s) => s.id === fileData.id)) {
        set({ subjects: [...existing, fileData] })
        saveToStorage('subjects', get().subjects)
      }
    }
  },

  removeSubject(subjectId) {
    const updated = get().subjects.filter((s) => s.id !== subjectId)
    set({ subjects: updated })
    saveToStorage('subjects', updated)
  },
}))

export default useQuizStore
