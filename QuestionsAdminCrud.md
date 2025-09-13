Questions Admin Crud – Canvas Build Instructions
TechPrep – Questions Admin CRUD (React)
Goal

Create an Admin Questions Manager UI (CRUD) in React based on the following types:

export interface Question {
  id: string;
  topicId: number;
  topicName: string;
  text: string;
  type: QuestionType;
  level: DifficultyLevel;
  officialAnswer?: string;
  options: QuestionOption[];
  learningResources: LearningResource[];
  createdAt: string;
  updatedAt: string;
}


export enum QuestionType {
  SingleChoice = 'single_choice',
  MultiChoice = 'multi_choice',
  Written = 'written'
}


export enum DifficultyLevel {
  Basic = 'basic',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}


export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}


export interface LearningResource {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
}

Build with React + TypeScript + React Hook Form + Zod + TanStack Table + shadcn/ui. Use Zustand or React Query for data fetching/state.

Structure
src/
├─ pages/admin/questions/
│  ├─ QuestionsPage.tsx           # list + filters + actions
│  ├─ QuestionFormDrawer.tsx      # create/edit (drawer or modal)
│  ├─ QuestionDetailsSheet.tsx    # optional read-only inspector
│  └─ QuestionsTable.tsx          # TanStack Table
├─ components/admin/questions/
│  ├─ OptionsRepeater.tsx         # field array for options
│  ├─ LearningResourcesRepeater.tsx
│  └─ TypeBadge.tsx               # UI badge for type/level
├─ services/admin/questionsApi.ts # API calls
├─ schemas/questionSchema.ts      # Zod schema + defaults
└─ utils/
   └─ enums.ts                    # maps for labels/icons
Routes

/admin/questions → QuestionsPage

Create → opens QuestionFormDrawer (mode: create)

Edit → opens QuestionFormDrawer (mode: edit)

View → opens QuestionDetailsSheet (optional)

Guard route with RoleGuard('Admin').

QuestionsPage (List + Filters)

Header actions:

Primary: New Question

Secondary: Import, Export CSV (optional)

Filters:

Topic (select, server-side options)

Type (segmented: Single | Multi | Written)

Level (segmented: Basic | Intermediate | Advanced)

Search (by text)

Table columns:

Checkbox (bulk)

text (truncate, tooltip)

topicName

type (chip/badge)

level (chip)

updatedAt (relative time)

Actions: Edit · View · Delete

Bulk actions: Delete, Export selected.

Pagination: server-side.

QuestionFormDrawer (Create/Edit)

Use React Hook Form + Zod. One form for create/edit with initial values.

Layout

Drawer with title: New Question | Edit Question

Sections: Basics · Content · Options (conditional) · Learning Resources

Footer: Save (primary) · Cancel

Fields – Basics

Topic: Select (fetch topics); store topicId, show topicName

Type: Segmented (SingleChoice | MultiChoice | Written)

Level: Segmented (Basic | Intermediate | Advanced)

Text: Textarea (required; the prompt/enunciado)

Fields – Content (depends on Type)

If Written:

officialAnswer: Textarea (required)

Helper: “Se valida por ≥80% coincidencia de palabras en Estudio; 100% en Entrevista (futuro).”

If SingleChoice or MultiChoice:

Show OptionsRepeater

OptionsRepeater

useFieldArray on options

Each row:

text (input)

isCorrect (radio if SingleChoice; checkbox if MultiChoice)

Drag handle (reorder) → updates orderIndex

Remove row

Buttons: Add option, Reorder (drag & drop)

Validation:

SingleChoice → exactly 1 option with isCorrect=true

MultiChoice → ≥1 options with isCorrect=true

At least 2 options total

LearningResourcesRepeater

useFieldArray on learningResources

Each row: title, url (validate), description (optional)

Auto-fill createdAt on submit (backend can also set server time)

Hidden/Derived fields

createdAt, updatedAt managed by backend; do not expose in form

Form Footer

Save → calls POST /api/admin/questions or PUT /api/admin/questions/:id

On success: close drawer + refresh table + toast success

On error: show inline errors/toast

Validation – Zod Schema
import { z } from 'zod';


export const questionSchema = z.object({
  id: z.string().uuid().optional(),
  topicId: z.number().int().positive(),
  topicName: z.string().min(1).optional(),
  text: z.string().min(10, 'Enter at least 10 characters'),
  type: z.enum(['single_choice','multi_choice','written']),
  level: z.enum(['basic','intermediate','advanced']),
  officialAnswer: z.string().optional(),
  options: z.array(z.object({
    id: z.string().uuid().optional(),
    text: z.string().min(1),
    isCorrect: z.boolean().default(false),
    orderIndex: z.number().int().nonnegative().optional(),
  })).default([]),
  learningResources: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1),
    url: z.string().url(),
    description: z.string().optional(),
    createdAt: z.string().optional(),
  })).default([]),
});


// Refinements for type-specific rules
export const questionSchemaRefined = questionSchema.superRefine((val, ctx) => {
  if (val.type === 'written') {
    if (!val.officialAnswer || val.officialAnswer.trim().length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Official answer required (≥10 chars) for written question', path: ['officialAnswer'] });
    }
  } else {
    if (val.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least 2 options required', path: ['options'] });
    }
    const correct = val.options.filter(o => o.isCorrect).length;
    if (val.type === 'single_choice' && correct !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Exactly one correct option is required', path: ['options'] });
    }
    if (val.type === 'multi_choice' && correct < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one correct option is required', path: ['options'] });
    }
  }
});
API Contract (admin/questionsApi.ts)
export const questionsApi = {
  list: (params) => http.get('/admin/questions', { params }),
  get: (id: string) => http.get(`/admin/questions/${id}`),
  create: (payload: Question) => http.post('/admin/questions', payload),
  update: (id: string, payload: Question) => http.put(`/admin/questions/${id}`, payload),
  remove: (id: string) => http.delete(`/admin/questions/${id}`),
};

Backend guards: [Authorize(Roles='Admin')] for all /api/admin/questions/* routes.

UI Details

Use shadcn/ui: Dialog/Drawer, Form, Input, Textarea, Select, Badge, Button, Switch, Checkbox, RadioGroup, Table, Toast.

Show Type & Level as colored badges in table rows.

Optimistic update optional for smoother UX when editing.

Keep topicId as the backend key; display topicName from topics list.

Support drag & drop to reorder options → update orderIndex on submit.

Default Values
const defaults: Question = {
  id: crypto.randomUUID(),
  topicId: 0,
  topicName: '',
  text: '',
  type: 'single_choice',
  level: 'basic',
  officialAnswer: '',
  options: [
    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 1 },
    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 2 },
  ],
  learningResources: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
Interactions & Edge Cases

Disable Save while submitting; show spinner.

Prevent Written → leaving officialAnswer empty.

Prevent Single → multiple isCorrect=true.

Confirm Delete with modal (irreversible).

If topic list is empty, show inline link to create topic (or restrict to existing).

Deliverables

QuestionsPage.tsx with table, filters, and actions.

QuestionFormDrawer.tsx with dynamic sections and Zod validations.

OptionsRepeater.tsx & LearningResourcesRepeater.tsx components.

questionsApi.ts wired to backend.

questionSchema.ts with refined Zod schema.

Minimal styling using shadcn/ui + Tailwind.

Done = I can create, edit, delete, and list questions; dynamic fields switch by type; options behave correctly for Single/Multi; written requires official answer; resources validate URLs; data persists via API.