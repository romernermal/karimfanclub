import { useNavigate } from 'react-router-dom'

export default function SubjectCard({ subject }) {
  const navigate = useNavigate()

  const colors = [
    'bg-blue-100 border-blue-300',
    'bg-emerald-100 border-emerald-300',
    'bg-amber-100 border-amber-300',
    'bg-purple-100 border-purple-300',
    'bg-rose-100 border-rose-300',
  ]
  const color = colors[subject.id.length % colors.length]

  return (
    <button
      onClick={() => navigate(`/subject/${subject.id}`)}
      className={`w-full p-6 rounded-2xl border-2 ${color} text-left transition-transform active:scale-[0.98] min-h-[80px] flex flex-col justify-center`}
    >
      <h2 className="text-lg font-semibold text-gray-900">{subject.name}</h2>
      <p className="text-sm text-gray-500 mt-1">
        {subject.tests.length} test{subject.tests.length !== 1 ? 's' : ''}
      </p>
    </button>
  )
}
