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

  masterQuizData: null,
  isMasterQuiz: false,

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
      isMasterQuiz: testId === '__master__',
    })
  },

  async buildMasterQuiz(subjectId) {
    const { subjects } = get()
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject) return

    for (const t of subject.tests) {
      if (t.fileName) {
        await get().loadTestData(t.id, t.fileName)
      }
    }

    const questions = []
    for (const t of subject.tests) {
      const testData = get().testsCache[t.id]
      if (!testData) continue
      for (const q of testData.questions) {
        questions.push({
          ...q,
          type: q.type || testData.testType,
          _source: `${subject.name} — ${testData.title}`,
        })
      }
    }

    set({
      masterQuizData: {
        title: `Master Quiz — ${subject.name}`,
        testType: null,
        questions,
      },
    })
  },

  setShuffleEnabled(enabled) {
    set({ shuffleEnabled: enabled })
    saveToStorage('shuffle', enabled)
  },

  initQuestionOrder() {
    const { currentTestId, testsCache, shuffleEnabled, isMasterQuiz, masterQuizData } = get()
    const test = isMasterQuiz ? masterQuizData : testsCache[currentTestId]
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
    const { currentTestId, testsCache, currentQuestionIndex, currentMode, questionOrder, isMasterQuiz, masterQuizData } =
      get()
    const test = isMasterQuiz ? masterQuizData : testsCache[currentTestId]
    if (!test) return

    const effectiveIndex = questionOrder.length > 0 ? questionOrder[currentQuestionIndex] : currentQuestionIndex
    const question = test.questions[effectiveIndex]
    const questionType = question.type || test.testType
    const isCorrect = gradeAnswer(question, answer, questionType)

    const result = { questionId: question.id, answer, isCorrect }
    const newResults = [...get().userAnswers, result]

    const updates = { userAnswers: newResults }

    if (!isCorrect && currentMode === 'no-mercy') {
      updates.quizComplete = true
    }

    set(updates)
  },

  nextQuestion() {
    const { currentTestId, testsCache, currentQuestionIndex, isMasterQuiz, masterQuizData } = get()
    const test = isMasterQuiz ? masterQuizData : testsCache[currentTestId]
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
      isMasterQuiz: false,
    })
  },

  async initSubjects() {
    let defaults = []
    try {
      const res = await fetch(DEFAULT_SUBJECTS_URL)
      const data = await res.json()
      defaults = data.subjects || []
    } catch {
      // no default manifest available
    }

    const stored = loadFromStorage('subjects') || []

    // Collect all test ids referenced by the final subject list
    const referencedTestIds = new Set()

    if (defaults.length > 0) {
      // Default manifest is authoritative for default subjects.
      // Replace any cached subject that exists in defaults.
      // Preserve subjects imported by the user (not in defaults).
      const defaultIds = new Set(defaults.map((s) => s.id))
      const imported = stored.filter((s) => !defaultIds.has(s.id))
      const merged = [...defaults, ...imported]

      merged.forEach((s) => s.tests.forEach((t) => referencedTestIds.add(t.id)))

      set({ subjects: merged })
      saveToStorage('subjects', merged)
    } else if (stored.length > 0) {
      stored.forEach((s) => s.tests.forEach((t) => referencedTestIds.add(t.id)))
      set({ subjects: stored })
    } else {
      set({ subjects: [] })
    }

    // Clean tests cache: remove entries no longer referenced by any subject
    const cached = loadFromStorage('testsCache') || {}
    const clean = {}
    for (const [id, data] of Object.entries(cached)) {
      if (referencedTestIds.has(id)) {
        clean[id] = data
      }
    }
    set({ testsCache: clean })
    saveToStorage('testsCache', clean)
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
