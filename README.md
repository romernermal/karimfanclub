# Quiz Practice

A mobile-first single-page quiz application built with React, Vite, Tailwind CSS, and Zustand. Supports multiple quiz modes (Normal, Friendly, No Mercy, Flashcards) and question types (MCQ, Identification, Fill-in-the-Blanks).

## Architecture

- **React** — UI framework
- **Vite** — build tool and dev server
- **Tailwind CSS** — utility-first styling (mobile-first, 44px+ tap targets)
- **Zustand** — lightweight state management
- **HashRouter** — GitHub Pages compatible routing (avoids 404 on refresh)
- **LocalStorage** — persists imported test files and progress

### Data Flow

1. **Subjects manifest** (`public/samples/subjects.json`) seeds the app on first load
2. Individual test files are fetched from `public/samples/` and cached in LocalStorage
3. Users can import additional JSON files via drag-and-drop or file picker
4. Quiz state (current question, answers, mode) is managed by Zustand store

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server.

## Deploying to GitHub Pages

```bash
npm run deploy
```

This runs `gh-pages -d dist` to push the `dist/` folder to the `gh-pages` branch.

## Importing Custom Content

1. Tap the **Import Subject** area on the home screen
2. Select or drag a JSON file into the dropzone
3. Accepted formats:
   - **Subjects manifest** — `{ "subjects": [...] }`
   - **Test file** — `{ "title", "testType", "questions": [...] }`
   - **Single subject** — `{ "id", "name", "tests": [...] }`

## Quiz Modes

| Mode       | Description |
|------------|-------------|
| Normal     | Answer all questions, see score at the end |
| Friendly   | Immediate feedback after each answer |
| No Mercy   | Ends on the first wrong answer |
| Flashcards | Flip cards to reveal answers, no scoring |

## Question Types

- **MCQ** — Multiple choice, single correct answer
- **Identification** — Free-text input, case-insensitive matching
- **Fill-in-the-Blanks** — Multiple blank inputs checked sequentially

## Project Structure

```
src/
├── main.jsx              # Entry point (HashRouter)
├── App.jsx               # Route definitions
├── index.css             # Tailwind + animations
├── stores/
│   └── quizStore.js      # Zustand store
├── pages/
│   ├── Home.jsx          # Subject grid + import
│   ├── TestSelection.jsx # Test list
│   ├── ModeSelection.jsx # Mode picker
│   ├── Quiz.jsx          # Quiz engine
│   └── Results.jsx       # Score + answer key
├── components/
│   ├── SubjectCard.jsx
│   ├── TestModeCard.jsx
│   ├── MCQInput.jsx
│   ├── TextInput.jsx
│   ├── FlashCard.jsx
│   ├── ProgressBar.jsx
│   ├── AnswerKey.jsx
│   └── ImportDropzone.jsx
└── utils/
    ├── grading.js        # Answer grading logic
    └── storage.js        # LocalStorage helpers
```
