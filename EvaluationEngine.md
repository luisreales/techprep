🛠 Instructions for ClaudeCode
1. Backend: Extend Evaluation Engine (RF-B04)
1.1 Create service EvaluationService

File: TechPrep.Application/Services/EvaluationService.cs

Methods:

Normalize(string input) → lower, strip accents/punctuation.

CalculateMatchPercent(string answer, string official) → split into tokens, compute (#matched / #official) * 100.

EvaluateSingleChoice(Question, SelectedOptionIds) → bool.

EvaluateMultiChoice(Question, SelectedOptionIds) → bool (all correct, no extras).

EvaluateWritten(QuestionAnswer, userText, threshold) → returns percent + bool.

1.2 Add interfaces

File: TechPrep.Application/Interfaces/IEvaluationService.cs
Register in Program.cs.

2. Backend: Answer persistence
2.1 Entities

Extend InterviewAnswer (or SessionAnswer) with:

GivenText, ChosenOptionsJson, IsCorrect, MatchPercent, TimeMs.

2.2 Repository methods

SaveAnswer(sessionId, questionId, userId, data) persists every attempt.

Add table AttemptHistory if not present:
(Id, SessionId, QuestionId, UserId, AnswerJson, Result, MatchPercent, Timestamp).

3. Backend: Endpoints
3.1 Students: answer submission

POST /api/sessions/{id}/answers

Body: { questionId, answerType, text?, options[] }.

Uses EvaluationService → evaluates, stores, returns result.

Practice (Kind=1): return immediate { correct, explanation, resources, matchPercent }.

Interview (Kind=2): return { accepted: true } (no feedback).

3.2 Summary endpoints

GET /api/sessions/{id}/summary

Always returns: total, correct, incorrect, per-topic stats, time.

Practice: includes per-question explanations.

Interview: aggregated only; explanations optional based on template config.

4. Backend: Analytics (RF-B06 link)

Add service AnalyticsService with:

GetUserStats(userId) → accuracy, time, weak topics.

GetGlobalStats() (for Admin dashboard).

Endpoints:

GET /api/users/{id}/stats

GET /api/admin/analytics/global

5. Frontend (React)
5.1 Services

Files:

src/services/sessionsApi.ts
Methods: submitAnswer, getSummary.

5.2 Practice Module (Kind=1)

Files:

src/pages/practice/PracticeRunnerPage.tsx

Features:

Render question with format:

Single → radio.

Multi → checkbox.

Written → textarea.

Buttons: Submit, View Answer (Practice only).

After submit:

Show ✅/❌, explanation, match %, suggested resources.

Navigation: Next/Prev, Skip, Mark for Review.

5.3 Interview Module (Kind=2)

Files:

src/pages/interviews/InterviewRunnerPage.tsx

Features:

Same rendering, but:

No hints, no “View Answer”.

Lock nav if template requires linear.

Timer strict → hard stop → auto submit.

At end: Summary (score, per topic, time).

6. Frontend: Catalog Integration

Practice catalog /practice/catalog → only load InterviewTemplates.Kind=1.

Interview catalog /interviews/catalog → only load InterviewTemplates.Kind=2.

Cards:

Practice: buttons: “Practice Session” (study) + “Take Real Session” (interview).

Interview: button: “Start Interview”.

7. Persistence & State

All answers saved via API (not local only).

Auto-save after each question.

If offline: queue → sync when online.

8. Reporting

After finishing session:

Practice: show detailed review screen with explanations + “Download CSV”.

Interview: show score + per-topic breakdown only.

9. Acceptance Criteria

 Practice mode returns immediate feedback with resources.

 Interview mode hides answers until end.

 Evaluation engine applies normalization + percent matching.

 Multi-choice requires exact match of correct set.

 Written answer success if ≥ threshold (default 80%).

 All answers persisted with timestamps.

 User can view history of attempts.

 Admin can see aggregated stats (weak topics, averages).

 Existing modules (Questions, Challenges, SessionTemplates) untouched.