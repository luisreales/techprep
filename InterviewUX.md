Interview UX/State Rules (Final)
State semantics

Assigned → InProgress → Submitted → Finalized

Finalized occurs in either of two flows:

User clicks Close on the summary → finalize + redirect to interviews home.

User clicks View Details (from anywhere) → finalize (if not yet) then open read-only details.

Backend (additive)
Endpoints

Finish (evaluate & compute)

POST /api/interviews/sessions/{id}/finish
→ sets Status="Submitted", SubmittedAt=now, computes metrics; idempotent.


Finalize (lock/close)

POST /api/interviews/sessions/{id}/finalize
→ allowed if Status ∈ {"Submitted","Finalized"}; sets Status="Finalized"; idempotent.


Summary / Details

GET /api/interviews/sessions/{id}/summary
→ returns summary for that session (no finalize side-effect).


List mine

GET /api/interviews/sessions/mine
→ rows with: id, parentSessionId, attemptNumber, assignmentName, status, score, totalItems, startedAt, submittedAt, durationSec


Retake (new row, no “Retake” state)

POST /api/interviews/sessions/{id}/retake
→ allowed only if Status="Finalized"; creates new session row (AttemptNumber+1, ParentSessionId=root), returns { interviewSessionId }


Keep all endpoints idempotent; never regress existing APIs.

Frontend (React) behavior
A) Summary page /interviews/summary/:sessionId

Buttons:

Close → call POST /finalize, then navigate('/interviews').

View Details → call POST /finalize (to ensure closed), then navigate('/interviews/review/:sessionId').

(No Retake here.)

B) Interviews home /interviews

Fetch GET /api/interviews/sessions/mine.

Per row actions:

InProgress → Continue

Submitted → Close (calls /finalize, refetch list)

Finalized → View Details and Retake

View Details → navigate('/interviews/review/:sessionId')

Retake → POST /retake → navigate('/interviews/runner/:newId')

C) View Details /interviews/review/:sessionId

Before rendering:

Call POST /finalize to ensure status is Finalized (no-op if already).

Show read-only attempt: questions, user selections/text, correctness, times. No editing.

D) Runner /interviews/runner/:sessionId

On submit:

POST /finish then navigate('/interviews/summary/:sessionId')

No “Back” (respect template rules). No Retake button here or on summary.

Minimal code hooks
// interviewsApi.ts
export const interviewsApi = {
  finish: (id: string) => http.post(`/interviews/sessions/${id}/finish`, {}),
  finalize: (id: string) => http.post(`/interviews/sessions/${id}/finalize`, {}),
  listMine: () => http.get('/interviews/sessions/mine').then(r=>r.data),
  retake: (id: string) => http.post(`/interviews/sessions/${id}/retake`, {}).then(r=>r.data),
  summary: (id: string) => http.get(`/interviews/sessions/${id}/summary`).then(r=>r.data),
  review: (id: string) => http.get(`/interviews/sessions/${id}/review`).then(r=>r.data),
};


Summary page actions

const onClose = async () => {
  await interviewsApi.finalize(sessionId);
  navigate('/interviews');
};

const onViewDetails = async () => {
  await interviewsApi.finalize(sessionId); // ensure closed
  navigate(`/interviews/review/${sessionId}`);
};


List row actions

if (row.status === 'Finalized') {
  // show View Details + Retake
  const onRetake = async () => {
    const { interviewSessionId } = await interviewsApi.retake(row.id);
    navigate(`/interviews/runner/${interviewSessionId}`);
  };
}


Review page guard

useEffect(() => {
  interviewsApi.finalize(sessionId).finally(() => loadReview());
}, [sessionId]);

Acceptance checklist

 Finalized is set when the user presses Close OR chooses View Details.

 Summary page never shows Retake; only Close and View Details.

 After Close, user is redirected to /interviews and the list is refreshed.

 In /interviews, finalized rows show View Details and Retake.

 Retake creates a new session row (AttemptNumber+1) and opens the runner.

 Attempt history remains per session id; summaries and reviews are per attempt.

If you want, I can also provide the small controller bodies for /finalize and /retake and a TSX table snippet for the interviews list.