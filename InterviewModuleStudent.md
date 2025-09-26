implementation-ready brief for ClaudeCode to build the Technical Interview APP — Interview Module exactly as you described. It’s additive, starts backend → frontend, includes file paths, DTOs, endpoints, DB migrations, and UI behaviors. Use .NET 8 Web API + EF Core (SQLite, Identity) and React + TS + Vite.

Technical Interview APP — Interview Module (Admin-independent)
0) Scope & Key Rules

This work implements Interview Mode for students and the runner at /interviews/runner/{id}.

Starting Interview Mode must create a new row in InterviewSessionNew, set NumberAttemps=1, and return InterviewSessionId for the runner route.

The runner provides Save / Edit / Clear / Skip controls per question, and a Submit Answer action to persist all answers for this interview attempt.

On Finalizar/Submit, persist answers into InterviewAnswerNew, update the parent session counters, and redirect to a summary.

Retake will increment attempts and start a new session for the same assignment.

NOTE: If existing Session entities are already present, do not modify them—add these new tables and endpoints independently.

1) Backend — Data Model & Migrations
1.1 Entities (new)

Files

src/TechPrep.Core/Entities/InterviewSessionNew.cs

src/TechPrep.Core/Entities/InterviewAnswerNew.cs

// InterviewSessionNew.cs
public class InterviewSessionNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }                     // Identity user
    public int AssignmentId { get; set; }                // InterviewTemplate Id (Kind=2) or assignment
    public string Status { get; set; } = "Active";       // Active | Submitted | Cancelled
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }

    public int TotalScore { get; set; }                  // reserved; 0 for now
    public int TotalTimeSec { get; set; }                // sum of per-question time
    public int CurrentQuestionIndex { get; set; }        // runner progress (0-based)
    public bool CertificateIssued { get; set; }          // false initial
    public int? ConsumedCreditLedgerId { get; set; }     // nullable

    public int CorrectCount { get; set; }                // updated on submit
    public int IncorrectCount { get; set; }              // updated on submit
    public int TotalItems { get; set; }                  // template question count
    public int NumberAttemps { get; set; } = 1;          // per-session attempt counter
}

// InterviewAnswerNew.cs
public class InterviewAnswerNew
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewSessionId { get; set; }
    public Guid QuestionId { get; set; }

    public string Type { get; set; } = "single";         // single|multiple|written
    public string? GivenText { get; set; }               // for written
    public string? ChosenOptionIdsJson { get; set; }     // for choice (store Guid[] or indexes)
    public bool IsCorrect { get; set; }                  // computed on submit
    public int? MatchPercent { get; set; }               // written percent if any (0–100)
    public int TimeMs { get; set; }                      // time spent on this item
    public int NumberAttemps { get; set; } = 1;          // attempt # for this question
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


DbContext

Add DbSet<InterviewSessionNew> InterviewSessionsNew and DbSet<InterviewAnswerNew> InterviewAnswersNew.

Migration

dotnet ef migrations add InterviewModule_NewTables -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet ef database update -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext


FK: InterviewAnswerNew.InterviewSessionId → InterviewSessionNew.Id.
(Optional) FK QuestionId → Questions table if exists.

2) Backend — Evaluation Engine (reuse RF-B04)

Use/extend your existing EvaluationService (RF-B04.*). If missing, create:

Files

src/TechPrep.Application/Interfaces/IEvaluationService.cs

src/TechPrep.Application/Services/EvaluationService.cs

Methods:

Normalize(string)

CalcMatchPercent(user, official, stopwords?)

EvalSingle(chosen, correct)

EvalMulti(chosen, correct) (exact set match)

EvalWritten(userText, officialText, thresholdPercent) → (bool isCorrect, int percent)

Threshold in interview is typically 100% but can be configured; if not configured, use 80% as default.

3) Backend — DTOs

Files

src/TechPrep.Application/DTOs/InterviewDtos.cs

public record StartInterviewRequest(int assignmentId); // InterviewTemplate (Kind=2)

public record StartInterviewResponse(Guid interviewSessionId);

public record RunnerQuestionDto(
  Guid QuestionId,
  string Type,                   // single|multiple|written
  string Text,
  IEnumerable<(Guid Id, string Text)>? Options, // null for written
  string Topic, string Level, int Index, int Total
);

public record RunnerStateDto(
  Guid InterviewSessionId,
  int CurrentQuestionIndex,
  int TotalItems,
  IEnumerable<RunnerQuestionDto> Questions  // preloaded or lazy-load by index
);

public record SaveLocalAnswerDto( // (optional) if you want per-question save; not required for batch submit
  Guid QuestionId, string Type, IEnumerable<Guid>? OptionIds, string? Text, int TimeMs
);

public record SubmitInterviewRequest( // batch submit
  IEnumerable<SubmitItem> Questions // see example payload in spec
);
public record SubmitItem(Guid QuestionId, string Type, IEnumerable<Guid>? OptionIds, string? Text, int TimeMs);

public record InterviewSummaryDto(
  Guid InterviewSessionId,
  DateTime StartedAt, DateTime SubmittedAt,
  int TotalItems, int CorrectCount, int IncorrectCount, int TotalTimeSec,
  IEnumerable<SummarySlice> ByTopic, IEnumerable<SummarySlice> ByType, IEnumerable<SummarySlice> ByLevel
);
public record SummarySlice(string Key, int Correct, int Total, double Accuracy);

public record RetakeResponse(Guid newInterviewSessionId, int numberAttemps);

4) Backend — Controllers & Endpoints

File

src/TechPrep.API/Controllers/InterviewRunnerController.cs

Routes (all [Authorize]):

Start interview session

POST /api/interviews/sessions
Body: StartInterviewRequest

Load template (Kind = 2) and compute TotalItems.

Create InterviewSessionNew:

UserId = current

AssignmentId = request.assignmentId

Status = "Active"

StartedAt = UtcNow

NumberAttemps = 1

TotalItems = template.TotalQuestions

Return { interviewSessionId }.

Get runner state

GET /api/interviews/sessions/{sessionId}/runner

Validate owner & status Active.

Return RunnerStateDto (either preload all questions, or just the current + neighbors).

Submit answers (batch)

POST /api/interviews/sessions/{sessionId}/submit

Body example:

{
  "questions": [
    { "questionId":"GUID", "type":"multiple", "optionIds":["GUID1","GUID2"], "timeMs":12345 },
    { "questionId":"GUID", "type":"written",  "text":"my answer...", "timeMs":8000 }
  ]
}


For each item:

Evaluate:

single/multiple via set equality

written via normalized keyword match → percent & threshold

Insert InterviewAnswerNew row with NumberAttemps = 1 (or current).

Update parent InterviewSessionNew:

CorrectCount, IncorrectCount, TotalTimeSec (sum timeMs), SubmittedAt = UtcNow, Status="Submitted".

Return InterviewSummaryDto.

Summary

GET /api/interviews/sessions/{sessionId}/summary → InterviewSummaryDto.

Retake

POST /api/interviews/sessions/{sessionId}/retake

Validate ownership; original must be Submitted.

Create new InterviewSessionNew:

Same AssignmentId

NumberAttemps = previous.NumberAttemps + 1

Status="Active", StartedAt=UtcNow, TotalItems=template.TotalQuestions

(Optional) If you also want to track attempts per question, you can increment InterviewAnswerNew.NumberAttemps when saving to the new session (i.e., per question’s attempt counter).

Return { newInterviewSessionId, numberAttemps }.

View submitted attempt (read-only)

GET /api/interviews/sessions/{sessionId}/review

Returns questions + the user’s recorded answers (read-only).

Log all significant actions with Serilog (interview_start, interview_submit, interview_retake, interview_review).

5) Frontend (React + TS) — Runner & Summary
5.1 Routing
/interviews/runner/:id          → InterviewRunnerPage  (id = InterviewSessionId)
/interviews/summary/:id         → InterviewSummaryPage
/interviews/review/:id          → InterviewReviewPage  (read-only)

5.2 Services

File: src/services/interviewApi.ts

import { http } from '@/utils/axios';

export const interviewApi = {
  start: (assignmentId: number) =>
    http.post<{ interviewSessionId: string }>('/interviews/sessions', { assignmentId }).then(r=>r.data),

  getRunner: (sessionId: string) =>
    http.get('/interviews/sessions/'+sessionId+'/runner').then(r=>r.data),

  submit: (sessionId: string, payload: { questions: Array<{ questionId: string; type: 'single'|'multiple'|'written'; optionIds?: string[]; text?: string; timeMs: number; }> }) =>
    http.post('/interviews/sessions/'+sessionId+'/submit', payload).then(r=>r.data),

  summary: (sessionId: string) =>
    http.get('/interviews/sessions/'+sessionId+'/summary').then(r=>r.data),

  retake: (sessionId: string) =>
    http.post('/interviews/sessions/'+sessionId+'/retake', {}).then(r=>r.data),

  review: (sessionId: string) =>
    http.get('/interviews/sessions/'+sessionId+'/review').then(r=>r.data),
};

5.3 Runner UI — /interviews/runner/:id

State & controls

Local state answersUser: Map<QuestionId, { type, optionIds?, text?, timeMs }>

Buttons per spec:

Guardar: stores current selection into answersUser (no server call).

Editar: enables inputs again for this question; overwrites on next Guardar.

Limpiar: clears selection or text for this question (updates local state).

Skip: moves to next question, inserts an entry with optionIds: [] or text: "", so the question is marked as answered with empty value (or simply no entry—both acceptable; server treats missing as incorrect).

Adelantar (Next): enabled only after Guardar. There is no Back in interview mode.

Submit Answer (finalize interview):

Builds payload:

const payload = {
  questions: Array.from(answersUser.entries()).map(([questionId, a]) => ({
    questionId, type: a.type, optionIds: a.optionIds, text: a.text, timeMs: a.timeMs ?? 0
  }))
};


Calls interviewApi.submit(sessionId, payload).

On success: navigate to /interviews/summary/${sessionId}.

UI hints

Show index Question X of N.

Disable all inputs after Submit.

Show a compact timer; sum times client-side and send per question in payload.

5.4 Summary — /interviews/summary/:id

Display:

StartedAt / SubmittedAt

Total / Correct / Incorrect / TotalItems

Total time

Buttons:

Ver Resumen → /interviews/review/:id (read-only view)

Retake → call interviewApi.retake(id), then navigate('/interviews/runner/'+newInterviewSessionId)

Salir → navigate to dashboard

Charts: by topic/level/type (if summary provides slices).

5.5 Review — /interviews/review/:id

Show interview questions read-only:

Question text, options (mark selected), written text

No editing; this is a historical snapshot.

6) Edge Cases & Validation

Start: must validate template is Kind = 2 (Interview).

Runner: if Status != Active, redirect to summary.

Submit:

Idempotent: if already submitted, return existing summary (HTTP 409 or 200 with a flag).

For missing items in payload, treat as incorrect with GivenText="" or no chosen options.

Server computes correctness (never trust client).

Retake:

Only allowed when Submitted.

Creates a new session; NumberAttemps in the new session = previous + 1.

(Optional) Also count per-question NumberAttemps when saving answers for that new session.

7) Acceptance Checklist

 Start creates row in InterviewSessionNew with NumberAttemps=1 and returns InterviewSessionId.

 Runner at /interviews/runner/{id} shows questions and enforces controls:

 Guardar, Editar, Limpiar, Skip

 Adelantar enabled only after Guardar

 No Back in interview mode

 Submit persists all answers to InterviewAnswerNew, re-evaluates correctness server-side, updates session counters, sets SubmittedAt, and returns summary.

 Summary shows totals, times, and action buttons (Ver Resumen, Retake, Salir).

 Retake creates a new session with incremented NumberAttemps and starts the runner again.

 Written answers are evaluated using normalization + keyword match percent (RF-B04.1–B04.3).

 Multiple-choice requires exact set match (RF-B04.4).

 Every saved answer stored with timestamp and NumberAttemps (RF-B04.5–B04.6).

8) Commands
# Backend
dotnet ef migrations add InterviewModule_NewTables -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet ef database update -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet run --project src/TechPrep.API

# Frontend
npm run dev


If you want, I can also output DTO class code, a controller skeleton, and Runner/Summary JSX scaffolds so it compiles immediately.