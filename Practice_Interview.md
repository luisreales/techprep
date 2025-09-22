A) ADMIN — Configuración total
A.0 Rutas y permisos

Base Admin: /admin

Subrutas:

/admin/templates (Plantillas: Practice/Interview)

/admin/assignments (Asignaciones y visibilidad)

/admin/questions (Banco de preguntas)

/admin/groups (Grupos)

/admin/plans (Planes/Top-ups)

/admin/credits (Ledger por usuario)

/admin/proctoring (Políticas/Certificados)

/admin/analytics (Dashboards)

Permisos: Admin, Editor (contenido), Evaluator (reportes), Support-RO (solo lectura).

A.1 Plantillas (Practice/Interview)

Componentes (Angular)

TemplatesList, TemplateEditor, TemplateRulesForm, TemplatePreview

API (.NET)

GET /api/templates?kind=practice|interview

POST /api/templates

PUT /api/templates/{id}

DELETE /api/templates/{id}

DTO (request)

{
  "name": "JS Basic 15m",
  "kind": "practice",                     // practice | interview
  "visibilityDefault": "public",          // public | group | private
  "selection": { "byTopics":[1,2], "levels":["basic"], "countSingle":5, "countMulti":5, "countWritten":5 },
  "timers": { "totalSec": 900, "perQuestionSec": 60 },
  "navigation": { "mode":"free","allowPause":true,"maxBacktracks":null },
  "feedback": { "mode":"immediate" },     // interview => "end"
  "aids": { "showHints":true,"showSources":true,"showGlossary":true },
  "attempts": { "max":0,"cooldownHours":0 },
  "integrity": { "requireFullscreen":false,"blockCopyPaste":false,"trackFocusLoss":true,"proctoring":false },
  "certification": { "enabled": false },
  "credits": { "interviewCost": 1 }
}


Validaciones

kind="interview" ⇒ aids.* = false, feedback.mode="end", navigation.allowPause=false.

timers.totalSec > 0, y selection devuelve ≥1 ítem.

AC

Crear/editar/clonar/eliminar; vista previa calcula ítems elegibles.

A.2 Asignaciones y visibilidad

Componentes

AssignmentsList, AssignmentEditor

API

GET /api/assignments?templateId={id}

POST /api/assignments

PUT /api/assignments/{id}

DELETE /api/assignments/{id}

DTO

{
  "templateId": 42,
  "visibility": "group",                   // public | group | private
  "groupId": 7,                            // requerido si visibility=group
  "userId": null,                          // requerido si visibility=private
  "windowStart": "2025-09-20T10:00:00Z",
  "windowEnd": "2025-09-30T23:59:59Z",
  "maxAttempts": 2,
  "cooldownHoursBetweenAttempts": 24,
  "certificationEnabled": true
}


Reglas

Entrevistas: por defecto no públicas (group/private).

Prácticas: públicas o asignadas a grupos/usuarios.

AC

Un estudiante miembro del grupo ve la asignación en su bandeja inmediatamente.

A.3 Banco de preguntas

Componentes

QuestionsTable, QuestionEditor, KeywordEditor, ResourcesEditor

API

GET /api/questions?topicId=&level=&usableIn=practice|interview|both

POST /api/questions

PUT /api/questions/{id}

DELETE /api/questions/{id}

Campos clave (nuevos, sin romper)

usableInPractice: bool, usableInInterview: bool

difficulty: enum, estimatedTimeSec: int

interviewCooldownDays: int, lastUsedInInterviewAt: datetime?

keywords: [{text,weight,required}] (o tabla QuestionKeywords)

AC

Ítems “interview only” nunca aparecen en prácticas.

Respeta cooldown tras uso en entrevista.

A.4 Grupos

Componentes

GroupsList, GroupEditor, GroupMembers

API

GET/POST/PUT/DELETE /api/groups

POST /api/groups/{id}/members (bulk add/remove)

AC

Un usuario puede pertenecer a varios grupos.

Filtros por grupo en analytics y asignaciones.

A.5 Planes, créditos y top-ups (negocio)

Componentes

PlansList, PlanEditor, CreditLedgerViewer, TopUpCreator

API

GET/POST/PUT/DELETE /api/plans

GET /api/users/{id}/credits/ledger

POST /api/users/{id}/credits/topup { "credits": 10, "expiresAt": "..." }

Reglas

Suscripción entrega X entrevistas/mes; cada entrevista consume 1 crédito al iniciar.

Top-ups agregan créditos (vencimiento configurable).

AC

Sin créditos ⇒ 402 con CTA para comprar top-up.

A.6 Proctoring y certificados (solo entrevistas)

Componentes

ProctoringPolicyForm, CertificateTemplateEditor

API

PUT /api/templates/{id}/integrity

GET /api/interviews/{sessionId}/certificate

AC

Eventos de integridad (focus, fullscreen, copy) se registran.

Certificado con ID único y URL/QR verificable.

A.7 Analítica y reportes

Componentes

AnalyticsDashboard (por plantilla, asignación, grupo, usuario)

API

GET /api/analytics/templates/{id}

GET /api/analytics/groups/{id}

Export CSV/PDF.

Métricas mínimas

Finalización, % acierto por tema, tiempo medio, incidentes de integridad.

B) ESTUDIANTE — Tomar Practice y Interview
B.0 Rutas (Navbar)

Practice /practice | Interview /interview

Subrutas:

/practice (catálogo/asignadas), /practice/run/:id

/interview (asignadas), /interview/run/:id

/results (historial y certificados)

B.1 Bandeja y catálogos

Componentes

PracticeCatalog, InterviewAssignments, ResultsList, CreditsBadge

API

GET /api/me/practice (públicas + por grupo/privadas asignadas)

GET /api/me/interviews (asignadas; públicas solo si así se definió)

GET /api/me/credits

AC

Muestra vencimientos, intentos restantes, créditos disponibles.

B.2 Practice (aprendizaje)

Componentes

PracticeRunner (progress, mini-mapa, anterior/siguiente/saltar/marcar, hints/sources/glossary)

API

POST /api/practice/start { "assignmentId": 11 }

POST /api/practice/{id}/answer → { "isCorrect":true,"explanation":"...","suggestedResources":[...] }

PATCH /api/practice/{id}/state (autosave)

POST /api/practice/{id}/submit

Reglas

Feedback inmediato; pausa si la plantilla lo permite; sin gamificación.

AC

Reanudación exacta tras refresh/caída; revisión final con explicaciones.

B.3 Interview (evaluación)

Componentes

InterviewRunner (pantalla de reglas, UI sin ayudas, control de integridad)

API

POST /api/interview/start { "assignmentId": 33 } → consume 1 crédito

POST /api/interview/{id}/answer (sin feedback)

POST /api/interview/{id}/submit

POST /api/interview/{id}/events { "type":"focus-lost"|"copy"|"fullscreen-exit","meta":{} }

Reglas

Navegación lineal o restringida; sin pausa (salvo excepción); feedback al final.

AC

Al expirar tiempo: auto-submit y bloqueo.

Cambiar de pestaña ≥N veces → evento en audit log.

B.4 Resultados y certificados

API

GET /api/me/results?type=practice|interview

GET /api/interviews/{id}/certificate (si habilitado)

AC

Practice: explicaciones completas. Interview: score global/por tema; certificado descargable/compartible.

C) Datos y migraciones mínimas (nombres con Grupos)

Mantengo todo lo existente. Agregados:

Nuevas tablas

Groups (Id, Name, OrgId?, CreatedAt)

UserGroups (GroupId, UserId, RoleInGroup?)

SessionAssignments (Id, TemplateId, Visibility[public|group|private], GroupId?, UserId?, WindowStart, WindowEnd, MaxAttempts, CooldownHoursBetweenAttempts, CertificationEnabled)

PracticeAnswer (Id, PracticeSessionId, QuestionId, SelectedOptionIds json/Text, IsCorrect, Score, AnsweredAt)

SessionAuditEvent (Id, SessionType['practice','interview'], SessionId, UserId, EventType, Meta json, CreatedAt)

SubscriptionPlans, UserSubscriptions, CreditTopUps, CreditLedger

ProctoringArtifacts, InterviewCertificate

(opcional) QuestionKeywords

Nuevas columnas

Questions: UsableInPractice, UsableInInterview, Difficulty, EstimatedTimeSec, InterviewCooldownDays, LastUsedInInterviewAt

SessionTemplates: Kind, VisibilityDefault, Timers, Navigation, Feedback, Aids, Attempts, Integrity, Certification, Credits

PracticeSessions/InterviewSession: Status, StartedAt, SubmittedAt, TotalScore, TotalTimeSec, (ConsumedCreditLedgerId en entrevista)

D) QA (aceptación clave)

Templates: crear una plantilla Interview ⇒ aids=false, feedback=end; vista previa válida.

Assignments: asignar a Grupo ⇒ los miembros lo ven; externos no.

Practice Runner: feedback inmediato + recursos; pausa/resume conserva timer.

Interview Runner: sin ayudas; al expirar tiempo auto-submit.

Créditos: iniciar entrevista descuenta 1 en CreditLedger; sin créditos ⇒ 402.

Proctoring: 3 pérdidas de foco ⇒ 3 eventos en SessionAuditEvent.

Certificados: si habilitado, se emite PDF/URL verificable.