# Quiz Data Schema

This document describes the JSON format for subjects manifests and test files used by the Quiz Practice app.

---

## Subjects Manifest

The manifest file (`subjects.json`) is loaded on first visit and lists all available subjects and their associated test files.

```jsonc
{
  "subjects": [
    {
      "id": "first-aid",                   // unique slug for the subject
      "name": "First Aid",                  // display name
      "tests": [
        { "id": "summative-1",             // unique slug for the test
          "fileName": "First_Aid_Summative_1.json" }  // filename in public/samples/
      ]
    }
  ]
}
```

---

## Test File

Each test file contains the test metadata and an array of question objects.

```jsonc
{
  "title": "First Aid - Summative 1",      // display title
  "testType": "mcq",                        // default question type (mcq | identification | fill_blanks)
  "questions": [ /* ... */ ]
}
```

`testType` is the fallback for any question that doesn't have its own `type` field.

---

## Question Types

### Multiple Choice (`"mcq"`)

```jsonc
{
  "id": "fa-q1",
  "question": "What is the first step in treating a severe burn?",
  "options": ["Apply ice", "Run cool water", "Apply butter", "Pop blisters"],
  "correctAnswer": 1                          // 0-based index into options[]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique question identifier |
| `question` | `string` | The question text |
| `options` | `string[]` | Answer choices |
| `correctAnswer` | `number` | Index of the correct option (0-based) |

Grading: the selected option index is compared to `correctAnswer`.

### Identification (`"identification"`)

```jsonc
{
  "id": "pc-q1",
  "question": "What is the derivative of sin(x)?",
  "answer": "cos(x)"
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique question identifier |
| `question` | `string` | The question text |
| `answer` | `string` | The correct answer |

Grading: case-insensitive trimmed string comparison.

### Fill-in-the-Blanks (`"fill_blanks"`)

```jsonc
{
  "id": "ph-q1",
  "question": "An object at _____ stays at _____ unless acted upon by an external force.",
  "answers": ["rest", "rest"]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique question identifier |
| `question` | `string` | Question text with `_____` (3+ underscores) as blank placeholders |
| `answers` | `string[]` | Correct fill values, in order |

Grading: each blank input is compared (case-insensitive trimmed) to the corresponding entry in `answers[]`.

#### Blank Syntax

Blanks in the question text are marked by 3 or more consecutive underscores:
- `___`
- `____`
- `_____`

Example:
```json
{
  "question": "Force equals _____ times _____.",
  "answers": ["mass", "acceleration"]
}
```

The text is split on the blank markers. The number of blanks in the text must equal the length of `answers[]`.

---

## Mixed-Type Tests

A single test can mix different question types. Add a `"type"` field to any question to override the test-level `"testType"`. Questions without a `"type"` inherit the default.

```jsonc
{
  "title": "Mixed-Type Example",
  "testType": "mcq",                        // fallback for questions without type
  "questions": [
    {
      "id": "mix-q1",
      "question": "What color is the sky?",
      "options": ["Red", "Blue", "Green"],
      "correctAnswer": 1                     // inherits testType -> mcq
    },
    {
      "id": "mix-q2",
      "type": "identification",             // overrides testType
      "question": "What is H₂O?",
      "answer": "water"
    },
    {
      "id": "mix-q3",
      "type": "fill_blanks",                // overrides testType
      "question": "Three states of matter: _____, _____, _____.",
      "answers": ["solid", "liquid", "gas"]
    }
  ]
}
```

---

## Import Behavior

When a file is imported via the **Import Subject** dropzone:

| Shape | Behavior |
|---|---|
| `{ subjects: [...] }` | Merges subjects by `id`. New tests from existing subjects are appended. New subjects are added. |
| `{ testType, questions }` | Treats as a test file. Auto-generates `subjectId` from the title prefix and creates/updates the subject entry. |
| `{ id, name, tests }` | Treats as a single subject. Added only if no subject with the same `id` exists. |

---

## LocalStorage Keys

| Key | Content |
|---|---|
| `quiz_subjects` | The subjects manifest (JSON array) |
| `quiz_testsCache` | Cached test data keyed by test `id` |
| `quiz_shuffle` | Boolean — whether randomize order is enabled |
