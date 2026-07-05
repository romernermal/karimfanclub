import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TestSelection from './pages/TestSelection'
import ModeSelection from './pages/ModeSelection'
import Quiz from './pages/Quiz'
import Results from './pages/Results'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/subject/:subjectId" element={<TestSelection />} />
      <Route path="/subject/:subjectId/test/:testId/mode" element={<ModeSelection />} />
      <Route path="/subject/:subjectId/test/:testId/quiz" element={<Quiz />} />
      <Route path="/subject/:subjectId/test/:testId/results" element={<Results />} />
    </Routes>
  )
}
