import { useEffect } from 'react'
import useQuizStore from '../stores/quizStore'
import SubjectCard from '../components/SubjectCard'
import ImportDropzone from '../components/ImportDropzone'

export default function Home() {
  const subjects = useQuizStore((s) => s.subjects)
  const initSubjects = useQuizStore((s) => s.initSubjects)

  useEffect(() => {
    initSubjects()
  }, [initSubjects])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Karim Fan Club</h1>
          <p className="text-sm text-gray-500 mt-1">Select a subject to start</p>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No subjects yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Import a JSON file below to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">
            Import Subject
          </h2>
          <ImportDropzone />
        </div>
      </div>
    </div>
  )
}
