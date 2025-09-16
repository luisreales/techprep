# TechPrep – Session Builder (Admin) + Practice Sessions
Stack: **React (TS, Vite)** + **.NET 8 Web API (SQLite, EF Core, Identity)**

## Objetivo (RF-B05)
- RF-B05.1: Creación de sesiones con configuración (plantillas).
- RF-B05.2: Selección aleatoria según filtros (tema/nivel/tipo).
- RF-B05.3: Tracking de tiempo por pregunta y sesión.
- RF-B05.4: Guardado automático de progreso.
- RF-B05.5: Finalización y cálculo de métricas.
- RF-B05.6: Reportes de sesión (incluye export CSV de falladas).

---

## 1) Backend (.NET 8) — Modelos / Migraciones

### 1.1 Nuevas entidades
```csharp
public enum PracticeMode { Study, Interview }
public enum TemplateStatus { Draft, Published }
public enum SessionItemType { Question, Challenge }

public class SessionTemplate {
  public int Id { get; set; }
  public string Name { get; set; } = default!;
  public PracticeMode Mode { get; set; }
  public string TopicsJson { get; set; } = "[]";    // [int]
  public string LevelsJson { get; set; } = "[]";    // ["basic","medium","difficult"]
  public bool RandomOrder { get; set; } = true;
  public int? TimeLimitMin { get; set; }
  public int ThresholdWritten { get; set; } = 80;
  public TemplateStatus Status { get; set; } = TemplateStatus.Draft;

  // Config JSON (auto/manual)
  public string QuestionsConfigJson { get; set; } = "{}";
  public string ChallengesConfigJson { get; set; } = "{}";

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime? UpdatedAt { get; set; }
}

public class SessionTemplateItem {                // opcional si “manual”
  public int Id { get; set; }
  public int TemplateId { get; set; }
  public SessionItemType ItemType { get; set; }
  public string ItemId { get; set; } = default!;  // Guid (question) o int (challenge) como string
  public int OrderIndex { get; set; }
}

// Ejecución
public class PracticeSession {
  public Guid Id { get; set; } = Guid.NewGuid();
  public Guid UserId { get; set; }
  public int? TemplateId { get; set; }
  public PracticeMode Mode { get; set; }
  public bool RandomOrder { get; set; }
  public int? TimeLimitMin { get; set; }
  public int ThresholdWritten { get; set; }
  public DateTime StartedAt { get; set; } = DateTime.UtcNow;
  public DateTime? FinishedAt { get; set; }
  public int TotalItems { get; set; }
  public int CorrectCount { get; set; }
  public int IncorrectCount { get; set; }
}

public class PracticeSessionItem {
  public Guid Id { get; set; } = Guid.NewGuid();
  public Guid SessionId { get; set; }
  public int OrderIndex { get; set; }
  public SessionItemType ItemType { get; set; }
  public string ItemId { get; set; } = default!;   // Guid question / int challenge
  public string Level { get; set; } = default!;
  public int TopicId { get; set; }
  // Tracking
  public int TimeMs { get; set; }                  // RF-B05.3
  public bool? IsCorrect { get; set; }
  public int? MatchPercent { get; set; }           // written
  public string? ChosenOptionsJson { get; set; }   // single/multi
  public string? GivenText { get; set; }           // written
  public bool? ChallengeSolved { get; set; }       // challenge
  public DateTime? AnsweredAt { get; set; }
}


Añadir relaciones en DbContext, migración Sessions_Initial, dotnet ef database update.

2) Backend — DTOs / Endpoints
2.1 Plantillas (Admin) /api/admin/session-templates

POST / crear
Body:

{
  "name":"Backend básico",
  "mode":"study",
  "topics":[1,2],
  "levels":["basic","medium"],
  "randomOrder":true,
  "timeLimitMin":60,
  "thresholdWritten":80,
  "questions": {
    "selection":"auto",
    "auto": { "single":5, "multi":5, "written":5, "byLevel":{"basic":8,"medium":6,"difficult":1} },
    "manualIds":[]
  },
  "challenges": {
    "selection":"manual",
    "auto": { "total":2, "byLevel":{"basic":1,"medium":1}, "languages":["js","csharp"] },
    "manualIds":[10,22]
  },
  "status":"draft"
}


PUT /{id} editar (sobrescribe).

GET / listar/buscar (q, status, mode).

GET /{id} detalle.

POST /{id}/publish → status=published.

POST /{id}/duplicate → clona a Draft.

DELETE /{id}.

Lógica

Guardar TopicsJson, LevelsJson, QuestionsConfigJson, ChallengesConfigJson.

Si selection=manual, persistir SessionTemplateItem con OrderIndex.

2.2 Construcción de sesión (Estudiante)

POST /api/sessions/from-template/{templateId}

Valida stock de preguntas/challenges.

Selección automática: query aleatoria por filtros; manual: respeta SessionTemplateItem.

Mezclar/ordenar según RandomOrder.

Crea PracticeSession + PracticeSessionItem[]. Responde sessionId.

POST /api/sessions/ad-hoc

Body similar a POST template pero sin persistir plantilla. Genera sesión al vuelo.

GET /api/sessions/{id}

Devuelve la lista ordenada de ítems (con payload mínimo para render: texto de pregunta/opciones/tipo o challenge prompt/meta).

POST /api/sessions/{id}/answers

Body:

{ "itemId":"guid", "timeMs":120000, "chosenOptions":[...], "givenText":"...", "challengeSolved":true }


Aplica scoring server-side:

single/multi: compara correctas.

written: normaliza, calcula % (umbral = session.ThresholdWritten y si Mode=Interview forzar 100%).

challenge: usa challengeSolved (MVP).

Actualiza PracticeSessionItem y counters de sesión.

POST /api/sessions/{id}/autosave (RF-B05.4)

Guarda timeMs y progreso parcial para itemId sin forzar corrección todavía.

POST /api/sessions/{id}/finish

Marca FinishedAt, recalcula métricas.

GET /api/sessions/{id}/summary

Totales, % por tema, % por tipo, tiempos, débiles (<70%).

GET /api/sessions/{id}/export-failed

CSV de preguntas/challenges no resueltos + recursos.

3) Backend — Selección aleatoria (RF-B05.2)
3.1 Preguntas

Filtro base: TopicId IN topics AND Level IN levels AND Type IN {single|multi|written}.

Aleatoriedad:

ORDER BY RANDOM() (SQLite) + Take(N) por tipo/por nivel.

Validar:

Si no alcanza stock → 400 con detalle por tipo/nivel.

3.2 Challenges

Filtro: Language IN, Difficulty IN levels, hasSolution? opcional.

ORDER BY RANDOM() + Take(N) por nivel.

Misma validación de stock.

4) Frontend React — UI & Rutas
4.1 Admin – Session Builder

Rutas protegidas RoleGuard('Admin'):

/admin/session-templates (lista)

/admin/session-templates/new

/admin/session-templates/:id/edit

/admin/session-templates/:id/preview

Componentes

AdminSessionTemplatesPage (tabla + filtros, acciones: Publish, Duplicate, Delete).

SessionTemplateForm

Campos generales: name, mode, topics (multi), levels (multi), timeLimitMin, randomOrder, thresholdWritten.

Tabs:

QuestionsTab: filtros + Auto/Manual.

Auto: inputs cantidad por tipo y byLevel.

Manual: tabla con filtros (checkbox select) + Añadir seleccionadas.

ChallengesTab: igual que preguntas (lenguaje/dificultad/tags).

TemplateSummaryCard: recuentos, tiempo estimado.

Botones: Guardar, Vista previa, Publicar.

4.2 Estudiante – Crear/ejecutar sesión

Rutas autenticadas:

/practice/new (selector: Plantilla publicada o Ad-hoc).

Si plantilla: Select → Start.

Si ad-hoc: formulario rápido (modo, temas, niveles, cantidades) → Start.

/sessions/:id/run

Header: progreso + timer total (si TimeLimitMin).

Card dinámica por item:

Question Single/Multi/Written (con live match para Study; oculto o 100% requerido en Interview).

Challenge (botón Marcar resuelto + notas).

Autosave: debounce 500ms para tiempo y borradores.

Footer: Anterior / Siguiente / Finalizar.

/sessions/:id/summary

Cards: total, correctas, incorrectas, tiempo total.

Charts: por tema y por tipo.

Tabla: no resueltas con link a recursos.

Botón: Export CSV.

Componentes

SessionStarterPage, TemplateSelector, AdHocBuilder

SessionRunnerPage, SessionHeader, SessionItemCard (single/multi/written/challenge)

SessionFooter, MatchIndicator (written)

SessionSummaryPage, SessionCharts, ExportCsvButton

5) Frontend — Servicios (Axios) + Query
// services/sessionTemplatesApi.ts (admin)
export const sessionTemplatesApi = {
  list: (params?) => http.get('/admin/session-templates',{params}).then(r=>r.data),
  get: (id:number) => http.get(`/admin/session-templates/${id}`).then(r=>r.data),
  create: (dto:any)=> http.post('/admin/session-templates', dto).then(r=>r.data),
  update: (id:number,dto:any)=> http.put(`/admin/session-templates/${id}`, dto).then(r=>r.data),
  publish: (id:number)=> http.post(`/admin/session-templates/${id}/publish`, {}).then(r=>r.data),
  duplicate: (id:number)=> http.post(`/admin/session-templates/${id}/duplicate`, {}).then(r=>r.data),
  remove: (id:number)=> http.delete(`/admin/session-templates/${id}`).then(r=>r.data),
};

// services/sessionsApi.ts (student/admin)
export const sessionsApi = {
  createFromTemplate: (id:number)=> http.post('/sessions/from-template/'+id,{}).then(r=>r.data),
  createAdHoc: (dto:any)=> http.post('/sessions/ad-hoc', dto).then(r=>r.data),
  get: (id:string)=> http.get('/sessions/'+id).then(r=>r.data),
  saveAnswer: (id:string,payload:any)=> http.post(`/sessions/${id}/answers`, payload).then(r=>r.data),
  autosave: (id:string,payload:any)=> http.post(`/sessions/${id}/autosave`, payload).then(r=>r.data),
  finish: (id:string)=> http.post(`/sessions/${id}/finish`, {}).then(r=>r.data),
  summary: (id:string)=> http.get(`/sessions/${id}/summary`).then(r=>r.data),
  exportFailed: (id:string)=> http.get(`/sessions/${id}/export-failed`, { responseType:'blob' }),
};


Añadir TanStack Query hooks: useTemplatesList, useTemplateForm, useSessionRun (con autosave y timers).

6) Timers + Autosave (RF-B05.3, RF-B05.4)

Frontend

useSessionTimers(sessionId):

Timer total (si TimeLimitMin) + timer por item.

Al cambiar de item o cada 5s → sessionsApi.autosave({ itemId, timeMs }).

Pausar al visibilitychange (tab oculta).

Backend

POST /sessions/{id}/autosave:

Actualiza PracticeSessionItem.TimeMs (acumulado).

No evalúa corrección salvo petición explícita.

7) Scoring (RF-B05.5)

Single/Multi: comparar opciones correctas.

Written: normalizar (minúsculas, sin tildes/puntuación).
percent = (#palabras_oficiales_matcheadas / #palabras_oficiales) * 100.

Mode=Study: correcto si percent >= ThresholdWritten (parcial 60–79 en UI).

Mode=Interview: correcto solo si percent == 100 (o umbral de plantilla si config lo permite).

Challenge: MVP: challengeSolved boolean (futuro: evaluator).

8) Reportes (RF-B05.6)

GET /sessions/{id}/summary →

total, correct, incorrect, timeTotal,

byTopic[] = {topicId, correct, total, accuracy},

byType[] = {type, correct, total, accuracy},

weakTopics[] (<70%).

GET /sessions/{id}/export-failed → CSV:
question/challenge, topic, level/difficulty, myAnswer, official, resourcesUrls.

9) Validaciones clave

Stock suficiente para selección automática; si falta → 400 con detalle.

Límites razonables: TotalItems <= 100, TimeLimitMin <= 240.

ThresholdWritten entre 60–100.

Seguridad:

Plantillas: /api/admin/session-templates* → [Authorize(Roles="Admin")].

Sesiones: /api/sessions* → [Authorize] (sólo dueño puede acceder a su sesión).

10) Aceptación

 Admin crea/edita/publica plantillas (auto/manual; mezcla preguntas/challenges).

 Estudiante inicia sesión desde plantilla o ad-hoc.

 Selección aleatoria funciona por filtros y respeta cantidades.

 Timers y autosave guardan tiempos/progreso.

 Finish calcula métricas y Summary muestra charts + CSV de falladas.

 Rutas y menús separados por rol (Admin vs Student).