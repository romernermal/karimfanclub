const PREFIX = 'quiz_'

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}

export function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(PREFIX + key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Failed to load from localStorage', e)
    return null
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    console.error('Failed to remove from localStorage', e)
  }
}
