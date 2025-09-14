# TechPrep – Code Challenges (Backend + React Frontend)

## Objetivo
Implementar **Code Challenges** con:
- **CRUD + metadata** (Admin).
- **Múltiples lenguajes** (enum/validación).
- **Solución oficial opcional**.
- **Tags y categorías/temas**.
- **Tests unitarios por challenge (JSON) almacenados**.
- **Tracking de intentos del usuario**.

**Roles**
- Admin: CRUD completo (rutas `/api/admin/challenges/*`).
- Autenticado (Student/Admin): listar, ver detalle, registrar intentos (`/api/challenges/*`).

---

## 1) Backend (.NET 8 Web API + SQLite) — resumen

### 1.1 Entidades (EF Core)
> Crear en `TechPrep.Core` y mapear en `TechPrepDbContext`:

```csharp
public enum ChallengeLanguage { CSharp, JavaScript, TypeScript, Python, Java, Go, Rust }
public enum ChallengeDifficulty { Basic, Medium, Hard }

public class CodeChallenge {
  public int Id { get; set; }
  public string Title { get; set; } = default!;
  public ChallengeLanguage Language { get; set; }
  public ChallengeDifficulty Difficulty { get; set; }
  public string Prompt { get; set; } = default!;       // Markdown
  public string? OfficialSolution { get; set; }        // opcional
  public string? TestsJson { get; set; }               // JSON de tests (string)
  public bool HasSolution => !string.IsNullOrWhiteSpace(OfficialSolution);
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime? UpdatedAt { get; set; }
  public ICollection<ChallengeTag> Tags { get; set; } = new List<ChallengeTag>();
  public ICollection<ChallengeTopic> Topics { get; set; } = new List<ChallengeTopic>();
}

public class Tag { public int Id { get; set; } public string Name { get; set; } = default!; }
public class Topic { public int Id { get; set; } public string Name { get; set; } = default!; }

public class ChallengeTag {
  public int CodeChallengeId { get; set; }
  public CodeChallenge CodeChallenge { get; set; } = default!;
  public int TagId { get; set; }
  public Tag Tag { get; set; } = default!;
}

public class ChallengeTopic {
  public int CodeChallengeId { get; set; }
  public CodeChallenge CodeChallenge { get; set; } = default!;
  public int TopicId { get; set; }
  public Topic Topic { get; set; } = default!;
}

public class ChallengeAttempt {
  public Guid Id { get; set; } = Guid.NewGuid();
  public Guid UserId { get; set; }
  public int CodeChallengeId { get; set; }
  public string? SubmittedCode { get; set; }
  public bool? MarkedSolved { get; set; }
  public int? Score { get; set; }                 // futuro (si evaluamos)
  public string? Notes { get; set; }
  public DateTime StartedAt { get; set; } = DateTime.UtcNow;
  public DateTime? FinishedAt { get; set; }
}
1.2 DTOs
csharp
Copiar código
public record ChallengeCreateDto(string Title,string Language,string Difficulty,string Prompt,string? OfficialSolution,string? TestsJson,List<string>? Tags,List<int>? TopicIds);
public record ChallengeUpdateDto(string Title,string Language,string Difficulty,string Prompt,string? OfficialSolution,string? TestsJson,List<string>? Tags,List<int>? TopicIds);
public record ChallengeListItemDto(int Id,string Title,string Language,string Difficulty,bool HasSolution,DateTime CreatedAt,IEnumerable<string> Tags);
public record ChallengeDetailDto(int Id,string Title,string Language,string Difficulty,string Prompt,bool HasSolution,string? OfficialSolution,string? TestsJson,IEnumerable<string> Tags,IEnumerable<string> Topics);
public record AttemptCreateDto(string? SubmittedCode,bool? MarkSolved,int? Score,string? Notes);
public record AttemptDto(Guid Id,int ChallengeId,DateTime StartedAt,DateTime? FinishedAt,bool? MarkedSolved,int? Score,string? Notes);
1.3 Endpoints
Público autenticado ([Authorize]) Route("api/challenges")

GET /api/challenges (filtros: language, difficulty, hasSolution, tag, topicId, q, page, pageSize, order)

GET /api/challenges/{id}

Intentos:

POST /api/challenges/{id}/attempts (body: AttemptCreateDto) → crea/empieza intento.

PUT /api/challenges/{id}/attempts/{attemptId} → actualizar intento.

GET /api/challenges/{id}/attempts/my → lista intentos del usuario.

Admin ([Authorize(Roles="Admin")]) Route("api/admin/challenges")

POST crear, PUT /{id} actualizar, DELETE /{id} eliminar, GET listar, GET /{id} detalle completo.

1.4 TestsJson (formato propuesto)
json
Copiar código
{
  "language": "JavaScript",
  "functionName": "twoSum",
  "tests": [
    { "input": [[2,7,11,15], 9], "expected": [0,1] },
    { "input": [[3,2,4], 6], "expected": [1,2] }
  ],
  "constraints": ["1 <= nums.length <= 10^4"]
}
Validar JSON bien formado y tamaño razonable.

2) Frontend React (Vite + TS)
2.1 Librerías sugeridas
Routing: react-router-dom

Data: TanStack Query (fetch/cache/retry/invalidate)

State auth: Zustand (ya lo usas)

Fetch: Axios (http con baseURL y bearer)

UI: tu stack (Tailwind + componentes propios)

Markdown: react-markdown (detalle de challenge)

Code: react-syntax-highlighter (mostrar solución oficial)

2.2 Estructura
cpp
Copiar código
src/
  services/
    api.ts            // público (challenges, attempts)
    adminApi.ts       // admin (CRUD)
  hooks/
    useChallenges.ts  // TanStack Query wrappers
  pages/
    challenges/
      ChallengesListPage.tsx
      ChallengeDetailPage.tsx
      ChallengeAttemptPanel.tsx
    admin/
      challenges/
        AdminChallengesPage.tsx
        AdminChallengeForm.tsx
  components/
    challenges/
      ChallengeCard.tsx
      ChallengeFilters.tsx
      TestsJsonViewer.tsx
2.3 Tipos (frontend)
ts
Copiar código
export type ChallengeLanguage = 'CSharp'|'JavaScript'|'TypeScript'|'Python'|'Java'|'Go'|'Rust';
export type ChallengeDifficulty = 'Basic'|'Medium'|'Hard';

export type ChallengeListItem = {
  id: number; title: string; language: ChallengeLanguage; difficulty: ChallengeDifficulty;
  hasSolution: boolean; createdAt: string; tags: string[];
};

export type ChallengeDetail = {
  id: number; title: string; language: ChallengeLanguage; difficulty: ChallengeDifficulty;
  prompt: string; hasSolution: boolean; officialSolution?: string | null;
  testsJson?: string | null; tags: string[]; topics: string[];
};

export type ChallengeCreate = {
  title: string; language: ChallengeLanguage; difficulty: ChallengeDifficulty;
  prompt: string; officialSolution?: string | null; testsJson?: string | null;
  tags?: string[]; topicIds?: number[];
};

export type Attempt = {
  id: string; challengeId: number; startedAt: string; finishedAt?: string | null;
  markedSolved?: boolean | null; score?: number | null; notes?: string | null;
};
2.4 Servicios (Axios)
ts
Copiar código
// services/api.ts (público)
import { http } from '@/utils/axios';
import type { ChallengeListItem, ChallengeDetail, Attempt } from '@/types';

export const challengesApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    http.get<ChallengeListItem[]>('/challenges', { params }).then(r => r.data),

  get: (id: number) =>
    http.get<ChallengeDetail>(`/challenges/${id}`).then(r => r.data),

  createAttempt: (id: number, payload: Partial<Attempt>) =>
    http.post<Attempt>(`/challenges/${id}/attempts`, payload).then(r => r.data),

  updateAttempt: (id: number, attemptId: string, payload: Partial<Attempt>) =>
    http.put<Attempt>(`/challenges/${id}/attempts/${attemptId}`, payload).then(r => r.data),

  listMyAttempts: (id: number) =>
    http.get<Attempt[]>(`/challenges/${id}/attempts/my`).then(r => r.data),
};

// services/adminApi.ts (admin)
import type { ChallengeCreate, ChallengeDetail, ChallengeListItem } from '@/types';
export const adminChallengesApi = {
  create: (dto: ChallengeCreate) => http.post<{id:number}>('/admin/challenges', dto).then(r => r.data),
  update: (id: number, dto: ChallengeCreate) => http.put<void>(`/admin/challenges/${id}`, dto).then(r => r.data),
  remove: (id: number) => http.delete<void>(`/admin/challenges/${id}`).then(r => r.data),
  get: (id: number) => http.get<ChallengeDetail>(`/admin/challenges/${id}`).then(r => r.data),
  list: (params?: Record<string, string | number | boolean>) =>
    http.get<ChallengeListItem[]>('/admin/challenges', { params }).then(r => r.data),
};
2.5 Hooks (TanStack Query)
ts
Copiar código
// hooks/useChallenges.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesApi, adminChallengesApi } from '@/services';

export const useChallengesList = (params?: any) =>
  useQuery({ queryKey: ['challenges', params], queryFn: () => challengesApi.list(params) });

export const useChallengeDetail = (id: number) =>
  useQuery({ queryKey: ['challenge', id], queryFn: () => challengesApi.get(id), enabled: !!id });

export const useCreateAttempt = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => challengesApi.createAttempt(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challengeAttempts', id] }),
  });
};

export const useAdminChallengeCrud = () => {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: adminChallengesApi.create,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['adminChallenges'] }),
    }),
    update: useMutation({
      mutationFn: ({id, dto}: {id:number; dto:any}) => adminChallengesApi.update(id, dto),
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: ['adminChallenges'] });
        qc.invalidateQueries({ queryKey: ['adminChallenge', vars.id] });
      },
    }),
    remove: useMutation({
      mutationFn: adminChallengesApi.remove,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['adminChallenges'] }),
    }),
  };
};
2.6 Páginas y componentes
Listado (público)

tsx
Copiar código
// pages/challenges/ChallengesListPage.tsx
// Filtros: lenguaje, dificultad, hasSolution, q, tag, topicId, order
// Muestra <ChallengeCard/> por item, paginación/scroll.
Detalle (público)

tsx
Copiar código
// pages/challenges/ChallengeDetailPage.tsx
// Tabs: Enunciado (markdown), Solución (si hasSolution), Tests (muestra JSON legible)
// Botón “Intentar” → crea intento (createAttempt) y muestra <ChallengeAttemptPanel/>
Panel de intento

tsx
Copiar código
// pages/challenges/ChallengeAttemptPanel.tsx
// Textarea para notas/código (opcional), Mark as solved, Save/Finish
// Usa updateAttempt para marcar terminado y/o resuelto.
Admin – Tabla + Form

tsx
Copiar código
// pages/admin/challenges/AdminChallengesPage.tsx
// Tabla con filtros y acciones (Editar/Eliminar/Nuevo)


// pages/admin/challenges/AdminChallengeForm.tsx
// RHF + Zod (Title, Language, Difficulty, Prompt markdown, OfficialSolution opcional,
// TestsJson textarea con validación JSON, Tags (chips), Topics (multiselect))
Extras

ChallengeFilters.tsx: barra de filtros controlados.

ChallengeCard.tsx: título, meta, badges de tags, botón “Ver detalle”.

TestsJsonViewer.tsx: intenta parsear testsJson y renderizar en tabla; si falla, muestra el raw.

2.7 Rutas (React Router)
tsx
Copiar código
// Public (autenticado)
<Route path="/challenges" element={<ChallengesListPage/>} />
<Route path="/challenges/:id" element={<ChallengeDetailPage/>} />

// Admin (protegidas con RoleGuard('Admin'))
<Route path="/admin/challenges" element={<AdminChallengesPage/>} />
<Route path="/admin/challenges/new" element={<AdminChallengeForm/>} />
<Route path="/admin/challenges/:id/edit" element={<AdminChallengeForm/>} />
2.8 Guards (recordatorio)
AuthGuard y RoleGuard('Admin') (Zustand lee roles del JWT o payload login).

Sidebar: muestra sección Admin solo si roles.includes('Admin').

3) Validaciones clave
language/difficulty válidos (mapear a enums).

prompt requerido; title único opcional por (language,difficulty).

testsJson bien formado (parse JSON con try/catch en FE para vista previa; el BE valida también).

Tags: normalizar (lower, trim) y evitar duplicados.

Intentos: createAttempt inicializa; updateAttempt marca solved/score/finish.

4) Aceptación
 Admin puede crear/editar/eliminar challenges con solución opcional, testsJson, tags y topics.

 Usuarios autenticados pueden listar y ver detalle (solución visible si existe).

 Intentos: crear/actualizar y listar los propios.

 Filtros por lenguaje/dificultad/tag/tópico/hasSolution/búsqueda funcionan.

 Rutas y menús protegidos por rol.

5) Comandos EF (backend)
bash
Copiar código
dotnet ef migrations add Challenges_Initial -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet ef database update -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
Nota: No implementar ejecución real de tests aún; solo almacenar testsJson y mostrarlo. El “marcar resuelto” y score sirven para el MVP de tracking.