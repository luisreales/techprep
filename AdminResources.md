Módulo: Admin Resources (RF-B08)
0) Alcance

CRUD de Recursos de aprendizaje (libro, video, artículo) con metadata.

Asociación recurso ↔ pregunta(s) y (opcional) ↔ tema(s).

Validación de URL estricta.

Recomendaciones: exponer endpoint basado en rendimiento del usuario.

Guard de seguridad: solo Admin puede CRUD; lectura pública autenticada.

1) Modelo de datos (EF Core)
public enum ResourceKind { Book, Video, Article } // libro/video/artículo
public enum ResourceDifficulty { Basic, Medium, Hard } // opcional para filtrar

public class LearningResource
{
    public int Id { get; set; }
    public ResourceKind Kind { get; set; }
    public string Title { get; set; } = default!;
    public string Url { get; set; } = default!;
    public string? Author { get; set; }            // RF-B08.5
    public TimeSpan? Duration { get; set; }        // HH:mm:ss (videos/cursos) RF-B08.5
    public double? Rating { get; set; }            // 0–5 (promedio) RF-B08.5
    public string? Description { get; set; }       // breve resumen
    public ResourceDifficulty? Difficulty { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<QuestionResource> QuestionLinks { get; set; } = new List<QuestionResource>();
    public ICollection<ResourceTopic> TopicLinks { get; set; } = new List<ResourceTopic>();
}

public class QuestionResource
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = default!;
    public int ResourceId { get; set; }
    public LearningResource Resource { get; set; } = default!;
    public string? Note { get; set; }              // “leer antes de resolver”, etc. RF-B08.2
}

public class ResourceTopic
{
    public int ResourceId { get; set; }
    public LearningResource Resource { get; set; } = default!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = default!;
}


DbContext: configurar PK compuesta para QuestionResource y ResourceTopic.
Migración: Resources_Initial (SQLite).

2) DTOs
public record ResourceCreateDto(
  string Kind,                 // "Book"|"Video"|"Article"
  string Title,
  string Url,
  string? Author,
  string? Duration,            // "PT45M" o "00:45:00" (acepta ISO 8601 o hh:mm:ss)
  double? Rating,              // 0..5
  string? Description,
  string? Difficulty,          // "Basic"|"Medium"|"Hard"
  List<Guid>? QuestionIds,     // asociaciones iniciales RF-B08.2
  List<int>? TopicIds
);

public record ResourceUpdateDto(
  string Kind, string Title, string Url, string? Author, string? Duration,
  double? Rating, string? Description, string? Difficulty,
  List<Guid>? QuestionIds, List<int>? TopicIds
);

public record ResourceListItemDto(
  int Id, string Kind, string Title, string Url, string? Author,
  double? Rating, string? Difficulty, DateTime CreatedAt, IEnumerable<string> Topics
);

public record ResourceDetailDto(
  int Id, string Kind, string Title, string Url, string? Author, string? Duration,
  double? Rating, string? Description, string? Difficulty,
  IEnumerable<Guid> QuestionIds, IEnumerable<string> Topics
);

3) Endpoints
3.1 Admin (CRUD) — [Authorize(Roles="Admin")] Route("api/admin/resources")

POST / → crear LearningResource (opcional: con asociaciones iniciales).

PUT /{id} → actualizar (sobrescribe asociaciones passadas en DTO).

DELETE /{id} → eliminar (cascade links).

GET / → listar (filtros: kind, topicId, difficulty, q, minRating).

GET /{id} → detalle.

3.2 Asociación desde módulo Questions (verificación RF-B08.2)

En QuestionsController (Admin) agregar/confirmar endpoints:

PUT /api/admin/questions/{id}/resources
Body: { resourceIds: number[], notes?: Record<number,string> }
→ Crea/actualiza filas en QuestionResource.

GET /api/admin/questions/{id}/resources → lista recursos asociados.

(Con esto validas “guardar recursos-preguntas” desde Questions. Alternativamente, usarlo desde Resources enviando QuestionIds.)

3.3 Público autenticado (consumo en FE)

GET /api/resources (filtros: topicId, kind, difficulty, q, minRating, limit)

GET /api/resources/recommended → RF-B08.3 (ver lógica abajo)

GET /api/questions/{id}/resources → recursos asociados a una pregunta

4) Validaciones (RF-B08.4 + RF-B08.5)

Kind ∈ {Book, Video, Article} (case-insensitive).

Title requerido; Url requerido y válido:

Debe ser http(s); rechazar javascript: y esquemas no permitidos.

(Opcional) allowlist de dominios para Video: YouTube/Vimeo; para Book/Article: cualquiera https.

Duration: aceptar hh:mm:ss o ISO-8601 (PT45M); convertir a TimeSpan.

Rating null o entre 0 y 5 (decimales permitidos).

Difficulty nula o ∈ {Basic, Medium, Hard}.

QuestionIds: existen en DB; evitar duplicados.

TopicIds: existen en DB; evitar duplicados.

5) Recomendaciones (RF-B08.3)

Endpoint: GET /api/resources/recommended?limit=10

Heurística MVP (server-side):

Analiza últimas N sesiones del usuario (p.ej. 10) en InterviewSession/InterviewAnswer.

Calcula temas débiles: topics con <70% de acierto o mayor frecuencia de error.

Busca recursos por esos topics ordenados por:

Rating (desc),

Difficulty ≈ nivel de la mayoría de fallos,

recientes primero (CreatedAt desc).

Devuelve hasta limit recursos mixtos (Book/Video/Article).

Notas:

Si no hay historial, devolver recursos “populares” (Rating alto) por temas globales.

Cache ligero por usuario (5–10 min) opcional.

6) Servicios (capas)

ResourceService

CreateAsync(dto), UpdateAsync(id,dto), DeleteAsync(id)

ListAsync(filters), GetAsync(id)

SetQuestionLinksAsync(resourceId, questionIds, notes?)

SetTopicLinksAsync(resourceId, topicIds)

RecommendationService

GetRecommendedAsync(userId, limit)

7) Frontend (React + TS)
7.1 Páginas (Admin)

/admin/resources (tabla + filtros)

Filtros: Tipo, Topic, Difficulty, Búsqueda, MinRating

Columnas: Título, Tipo, Autor, Rating, Topics, Acciones (Editar/Eliminar)

/admin/resources/new y /admin/resources/:id/edit
Formulario:

Tipo (select Book/Video/Article)

Título (input)

URL (input con validación y preview)

Autor (input)

Duración (input hh:mm:ss)

Rating (slider 0–5)

Descripción (textarea)

Difficulty (select)

Topics (multiselect)

Asociar preguntas (buscador + multi-select, muestra tags “añadidos”)

[Guardar] / [Cancelar]

Componentes:

ResourceForm.tsx (RHF + Zod, validación URL/duration/rating)

ResourcesTable.tsx (TanStack Table o simple)

ResourceFilters.tsx

Servicios:

adminResourcesApi:

list(params), get(id), create(dto), update(id,dto), remove(id)

Para asociaciones desde preguntas (verificación RF-B08.2):

adminQuestionsApi.setResources(questionId, { resourceIds, notes? })

adminQuestionsApi.getResources(questionId)

7.2 Consumo (estudiante)

resourcesApi.list(params) → mostrará recursos según filtros y recomendaciones.

resourcesApi.recommended(limit) → lista “Recomendado para ti”.

8) Seguridad

Admin: /api/admin/resources/* protegido con [Authorize(Roles="Admin")].

Lectura: /api/resources* protegido con [Authorize].

Swagger con JWT Bearer para probar ambos.

9) Criterios de aceptación (checklist)

 CRUD de recursos operativo (crear, editar, eliminar, listar con filtros).

 Tipos soportados: Book / Video / Article (UI + back).

 URL validada (http/https; sin esquemas peligrosos).

 Metadata guardada: duration, author, rating (0–5), description, difficulty.

 Asociación recurso-pregunta:

desde Resources (en create/update con QuestionIds), y/o

desde Questions (PUT /questions/{id}/resources).

Verificación: al guardar, aparecen filas en QuestionResource.

 Recomendaciones devuelven recursos relevantes según rendimiento (<70%).

 Rutas protegidas por rol; lectura solo autenticados.

10) Comandos EF (recordatorio)
dotnet ef migrations add Resources_Initial -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet ef database update -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
