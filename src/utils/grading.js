export function gradeAnswer(question, answer, testType) {
  switch (testType) {
    case 'mcq':
      return answer === question.correctAnswer

    case 'identification':
      return (
        String(answer).trim().toLowerCase() ===
        String(question.answer).trim().toLowerCase()
      )

    case 'fill_blanks': {
      if (!Array.isArray(answer) || !Array.isArray(question.answers)) {
        return false
      }
      return question.answers.every(
        (a, i) =>
          answer[i] &&
          String(answer[i]).trim().toLowerCase() ===
            String(a).trim().toLowerCase()
      )
    }

    default:
      return false
  }
}

export function getCorrectAnswerText(question, testType) {
  switch (testType) {
    case 'mcq':
      return question.options[question.correctAnswer]
    case 'identification':
      return question.answer
    case 'fill_blanks':
      return question.answers.join(', ')
    default:
      return ''
  }
}
