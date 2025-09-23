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

A.3 Banco de preguntas (Questions)
Modifica el componente Questions y agrega estos componentes adicionales complementarios.

**Componentes (React + TypeScript)**

```typescript
// QuestionsTable.tsx - Tabla principal con filtros avanzados
interface QuestionsTableProps {
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onKeywordEdit: (questionId: string) => void;
  onResourceEdit: (questionId: string) => void;
}

// QuestionEditor.tsx - Formulario completo para crear/editar preguntas
interface QuestionEditorProps {
  question?: Question;
  onSave: (question: CreateQuestionRequest) => Promise<void>;
  onCancel: () => void;
}

// KeywordEditor.tsx - Gestión de keywords con peso y requerimiento
interface KeywordEditorProps {
  questionId: string;
  keywords: QuestionKeyword[];
  onSave: (keywords: QuestionKeyword[]) => Promise<void>;
}

// ResourcesEditor.tsx - Enlaces y recursos adicionales por pregunta
interface ResourcesEditorProps {
  questionId: string;
  resources: QuestionResource[];
  onSave: (resources: QuestionResource[]) => Promise<void>;
}
```

**API Endpoints (.NET)**

```csharp
// GET /api/questions?topicId=&level=&usableIn=practice|interview|both&page=1&pageSize=50
[HttpGet]
public async Task<ActionResult<ApiResponse<PagedResult<QuestionDto>>>> GetQuestions(
    [FromQuery] GetQuestionsQuery query)

// POST /api/questions
[HttpPost]
public async Task<ActionResult<ApiResponse<QuestionDto>>> CreateQuestion(
    [FromBody] CreateQuestionRequest request)

// PUT /api/questions/{id}
[HttpPut("{id}")]
public async Task<ActionResult<ApiResponse<QuestionDto>>> UpdateQuestion(
    Guid id, [FromBody] UpdateQuestionRequest request)

// DELETE /api/questions/{id}
[HttpDelete("{id}")]
public async Task<ActionResult<ApiResponse<bool>>> DeleteQuestion(Guid id)

// POST /api/questions/{id}/keywords
[HttpPost("{id}/keywords")]
public async Task<ActionResult<ApiResponse<List<QuestionKeywordDto>>>> UpdateKeywords(
    Guid id, [FromBody] List<UpdateKeywordRequest> keywords)

// POST /api/questions/{id}/resources
[HttpPost("{id}/resources")]
public async Task<ActionResult<ApiResponse<List<QuestionResourceDto>>>> UpdateResources(
    Guid id, [FromBody] List<UpdateResourceRequest> resources)
```

**Campos clave (nuevos, sin romper esquema existente)**

```csharp
// Nuevas propiedades en Question entity
public bool UsableInPractice { get; set; } = true;
public bool UsableInInterview { get; set; } = true;
public QuestionDifficulty Difficulty { get; set; } = QuestionDifficulty.Basic;
public int EstimatedTimeSec { get; set; } = 60;
public int InterviewCooldownDays { get; set; } = 0;
public DateTime? LastUsedInInterviewAt { get; set; }

// Nueva tabla QuestionKeywords
public class QuestionKeyword
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Text { get; set; }
    public double Weight { get; set; } = 1.0;
    public bool IsRequired { get; set; } = false;
    public Question Question { get; set; }
}

// Nueva tabla QuestionResources
public class QuestionResource
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Title { get; set; }
    public string Url { get; set; }
    public string Type { get; set; } // "documentation", "tutorial", "video", "article"
    public int OrderIndex { get; set; }
    public Question Question { get; set; }
}

// Enum para dificultad
public enum QuestionDifficulty
{
    Basic = 1,
    Intermediate = 2,
    Advanced = 3
}
```

**DTOs y Requests**

```csharp
public class CreateQuestionRequest
{
    public Guid TopicId { get; set; }
    public string Text { get; set; }
    public QuestionType Type { get; set; }
    public QuestionLevel Level { get; set; }
    public string OfficialAnswer { get; set; }
    public bool UsableInPractice { get; set; } = true;
    public bool UsableInInterview { get; set; } = true;
    public QuestionDifficulty Difficulty { get; set; }
    public int EstimatedTimeSec { get; set; } = 60;
    public int InterviewCooldownDays { get; set; } = 0;
    public List<CreateQuestionOptionRequest> Options { get; set; } = new();
    public List<CreateKeywordRequest> Keywords { get; set; } = new();
    public List<CreateResourceRequest> Resources { get; set; } = new();
}

public class CreateKeywordRequest
{
    public string Text { get; set; }
    public double Weight { get; set; } = 1.0;
    public bool IsRequired { get; set; } = false;
}

public class CreateResourceRequest
{
    public string Title { get; set; }
    public string Url { get; set; }
    public string Type { get; set; }
    public int OrderIndex { get; set; }
}
```

**Business Logic - QuestionService**

```csharp
public class QuestionService : IQuestionService
{
    public async Task<List<Question>> GetEligibleQuestionsAsync(
        QuestionSelectionCriteria criteria,
        bool isInterviewMode = false)
    {
        var query = _context.Questions
            .Include(q => q.Keywords)
            .Include(q => q.Resources)
            .Where(q => isInterviewMode ? q.UsableInInterview : q.UsableInPractice);

        if (isInterviewMode)
        {
            // Aplicar cooldown para entrevistas
            query = query.Where(q =>
                q.InterviewCooldownDays == 0 ||
                q.LastUsedInInterviewAt == null ||
                q.LastUsedInInterviewAt.Value.AddDays(q.InterviewCooldownDays) <= DateTime.UtcNow);
        }

        if (criteria.TopicIds?.Any() == true)
            query = query.Where(q => criteria.TopicIds.Contains(q.TopicId));

        if (criteria.Levels?.Any() == true)
            query = query.Where(q => criteria.Levels.Contains(q.Level));

        if (criteria.Difficulties?.Any() == true)
            query = query.Where(q => criteria.Difficulties.Contains(q.Difficulty));

        return await query.ToListAsync();
    }

    public async Task MarkQuestionUsedInInterviewAsync(Guid questionId)
    {
        var question = await _context.Questions.FindAsync(questionId);
        if (question != null)
        {
            question.LastUsedInInterviewAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
```

**Frontend Components Implementation**

```typescript
// hooks/useQuestions.ts
export const useQuestions = () => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PagedResult<Question>>>('/api/questions');
      return response.data;
    }
  });
};

// components/admin/QuestionsTable.tsx
export const QuestionsTable: React.FC<QuestionsTableProps> = ({ onEdit, onDelete, onKeywordEdit, onResourceEdit }) => {
  const [filters, setFilters] = useState({
    topicId: '',
    level: '',
    usableIn: 'both' as 'practice' | 'interview' | 'both',
    search: ''
  });

  const { data: questions, isLoading } = useQuestions();

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={filters.usableIn}
          onChange={(e) => setFilters(prev => ({ ...prev, usableIn: e.target.value as any }))}
          className="px-3 py-2 border rounded-md"
        >
          <option value="both">Ambos modos</option>
          <option value="practice">Solo práctica</option>
          <option value="interview">Solo entrevista</option>
        </select>
        <input
          type="text"
          placeholder="Buscar preguntas..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="px-3 py-2 border rounded-md flex-1"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pregunta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tema</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dificultad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Est.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions?.items.map((question) => (
              <tr key={question.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {question.text.substring(0, 50)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {question.topic?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(question.level)}`}>
                    {question.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {question.estimatedTimeSec}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-1">
                    {question.usableInPractice && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">P</span>
                    )}
                    {question.usableInInterview && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">E</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(question)} className="text-blue-600 hover:text-blue-900">
                      Editar
                    </button>
                    <button onClick={() => onKeywordEdit(question.id)} className="text-green-600 hover:text-green-900">
                      Keywords
                    </button>
                    <button onClick={() => onResourceEdit(question.id)} className="text-purple-600 hover:text-purple-900">
                      Recursos
                    </button>
                    <button onClick={() => onDelete(question.id)} className="text-red-600 hover:text-red-900">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

**AC (Criterios de Aceptación)**

1. **Separación de modos**: Ítems marcados como "interview only" (`usableInInterview=true, usableInPractice=false`) nunca aparecen en sesiones de práctica.

2. **Cooldown de entrevistas**: Preguntas con `interviewCooldownDays > 0` respetan el período de enfriamiento tras ser usadas en entrevistas antes de poder reutilizarse.

3. **Gestión de keywords**: Sistema de palabras clave con peso y marcado de requerimiento para mejorar el matching de respuestas escritas.

4. **Recursos educativos**: Capacidad de asociar enlaces, documentación y materiales de apoyo por pregunta.

5. **Filtros avanzados**: Interface de administración permite filtrar por modo de uso, dificultad, tiempo estimado y otros criterios.

6. **Migración sin ruptura**: Todas las preguntas existentes mantienen compatibilidad, con valores por defecto para los nuevos campos.

A.4 Grupos

**Componentes (React + TypeScript)**

```typescript
// GroupsList.tsx - Lista principal de grupos con búsqueda y filtros
interface GroupsListProps {
  onEdit: (group: Group) => void;
  onDelete: (groupId: number) => void;
  onManageMembers: (groupId: number) => void;
  onViewAnalytics: (groupId: number) => void;
}

// GroupEditor.tsx - Formulario para crear/editar grupos
interface GroupEditorProps {
  group?: Group;
  onSave: (group: CreateGroupRequest) => Promise<void>;
  onCancel: () => void;
}

// GroupMembers.tsx - Gestión de miembros con búsqueda y roles
interface GroupMembersProps {
  groupId: number;
  onClose: () => void;
}

// GroupMemberSelector.tsx - Selector de usuarios para agregar al grupo
interface GroupMemberSelectorProps {
  groupId: number;
  excludeUserIds: string[];
  onAddMembers: (userIds: string[]) => Promise<void>;
}
```

**API Endpoints (.NET)**

```csharp
// GET /api/groups?search=&organizationId=&page=1&pageSize=50
[HttpGet]
public async Task<ActionResult<ApiResponse<PagedResult<GroupDto>>>> GetGroups(
    [FromQuery] GetGroupsQuery query)

// POST /api/groups
[HttpPost]
public async Task<ActionResult<ApiResponse<GroupDto>>> CreateGroup(
    [FromBody] CreateGroupRequest request)

// PUT /api/groups/{id}
[HttpPut("{id}")]
public async Task<ActionResult<ApiResponse<GroupDto>>> UpdateGroup(
    int id, [FromBody] UpdateGroupRequest request)

// DELETE /api/groups/{id}
[HttpDelete("{id}")]
public async Task<ActionResult<ApiResponse<bool>>> DeleteGroup(int id)

// GET /api/groups/{id}/members
[HttpGet("{id}/members")]
public async Task<ActionResult<ApiResponse<List<GroupMemberDto>>>> GetGroupMembers(int id)

// POST /api/groups/{id}/members
[HttpPost("{id}/members")]
public async Task<ActionResult<ApiResponse<List<GroupMemberDto>>>> AddGroupMembers(
    int id, [FromBody] AddGroupMembersRequest request)

// DELETE /api/groups/{id}/members
[HttpDelete("{id}/members")]
public async Task<ActionResult<ApiResponse<bool>>> RemoveGroupMembers(
    int id, [FromBody] RemoveGroupMembersRequest request)

// PUT /api/groups/{id}/members/{userId}/role
[HttpPut("{id}/members/{userId}/role")]
public async Task<ActionResult<ApiResponse<GroupMemberDto>>> UpdateMemberRole(
    int id, string userId, [FromBody] UpdateMemberRoleRequest request)
```

**Data Models**

```csharp
// Group entity
public class Group
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public int? OrganizationId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserId { get; set; }

    // Navigation properties
    public Organization? Organization { get; set; }
    public User CreatedByUser { get; set; }
    public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
    public ICollection<SessionAssignment> SessionAssignments { get; set; } = new List<SessionAssignment>();
}

// UserGroup junction table for many-to-many relationship
public class UserGroup
{
    public int GroupId { get; set; }
    public string UserId { get; set; }
    public GroupRole Role { get; set; } = GroupRole.Member;
    public DateTime JoinedAt { get; set; }
    public string? AddedByUserId { get; set; }

    // Navigation properties
    public Group Group { get; set; }
    public User User { get; set; }
    public User? AddedByUser { get; set; }
}

// Enum for group roles
public enum GroupRole
{
    Member = 1,
    Moderator = 2,
    Admin = 3
}

// Organization entity (optional, for enterprise features)
public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Domain { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
```

**DTOs y Requests**

```csharp
public class CreateGroupRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public int? OrganizationId { get; set; }

    public List<string> InitialMemberIds { get; set; } = new();
}

public class UpdateGroupRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}

public class AddGroupMembersRequest
{
    [Required]
    public List<string> UserIds { get; set; } = new();

    public GroupRole DefaultRole { get; set; } = GroupRole.Member;
}

public class RemoveGroupMembersRequest
{
    [Required]
    public List<string> UserIds { get; set; } = new();
}

public class UpdateMemberRoleRequest
{
    [Required]
    public GroupRole Role { get; set; }
}

public class GroupDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public int? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; }
    public int MemberCount { get; set; }
    public GroupRole? CurrentUserRole { get; set; }
}

public class GroupMemberDto
{
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public GroupRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public string? AddedByUserId { get; set; }
    public string? AddedByUserName { get; set; }
}
```

**Business Logic - GroupService**

```csharp
public class GroupService : IGroupService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public async Task<PagedResult<GroupDto>> GetGroupsAsync(GetGroupsQuery query)
    {
        var currentUserId = _currentUserService.UserId;
        var isAdmin = await _currentUserService.IsInRoleAsync("Admin");

        var groupsQuery = _context.Groups
            .Include(g => g.Organization)
            .Include(g => g.CreatedByUser)
            .Include(g => g.UserGroups)
            .AsQueryable();

        // Non-admin users only see groups they're members of
        if (!isAdmin)
        {
            groupsQuery = groupsQuery.Where(g =>
                g.UserGroups.Any(ug => ug.UserId == currentUserId));
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            groupsQuery = groupsQuery.Where(g =>
                g.Name.Contains(query.Search) ||
                g.Description.Contains(query.Search));
        }

        if (query.OrganizationId.HasValue)
        {
            groupsQuery = groupsQuery.Where(g => g.OrganizationId == query.OrganizationId);
        }

        var totalCount = await groupsQuery.CountAsync();

        var groups = await groupsQuery
            .OrderBy(g => g.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                OrganizationId = g.OrganizationId,
                OrganizationName = g.Organization != null ? g.Organization.Name : null,
                IsActive = g.IsActive,
                CreatedAt = g.CreatedAt,
                CreatedByUserId = g.CreatedByUserId,
                CreatedByUserName = g.CreatedByUser.FirstName + " " + g.CreatedByUser.LastName,
                MemberCount = g.UserGroups.Count,
                CurrentUserRole = g.UserGroups
                    .Where(ug => ug.UserId == currentUserId)
                    .Select(ug => (GroupRole?)ug.Role)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return new PagedResult<GroupDto>
        {
            Items = groups,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<GroupDto> CreateGroupAsync(CreateGroupRequest request)
    {
        var currentUserId = _currentUserService.UserId;

        var group = new Group
        {
            Name = request.Name,
            Description = request.Description,
            OrganizationId = request.OrganizationId,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = currentUserId
        };

        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        // Add creator as admin
        var creatorMembership = new UserGroup
        {
            GroupId = group.Id,
            UserId = currentUserId,
            Role = GroupRole.Admin,
            JoinedAt = DateTime.UtcNow,
            AddedByUserId = currentUserId
        };
        _context.UserGroups.Add(creatorMembership);

        // Add initial members
        foreach (var memberId in request.InitialMemberIds)
        {
            if (memberId != currentUserId) // Skip creator (already added)
            {
                var membership = new UserGroup
                {
                    GroupId = group.Id,
                    UserId = memberId,
                    Role = GroupRole.Member,
                    JoinedAt = DateTime.UtcNow,
                    AddedByUserId = currentUserId
                };
                _context.UserGroups.Add(membership);
            }
        }

        await _context.SaveChangesAsync();

        return await GetGroupByIdAsync(group.Id);
    }

    public async Task<bool> AddMembersAsync(int groupId, AddGroupMembersRequest request)
    {
        var currentUserId = _currentUserService.UserId;

        // Verify current user has permission to add members
        var currentUserRole = await GetUserRoleInGroupAsync(groupId, currentUserId);
        if (currentUserRole < GroupRole.Moderator)
        {
            throw new UnauthorizedAccessException("Insufficient permissions to add members");
        }

        // Get existing members to avoid duplicates
        var existingMemberIds = await _context.UserGroups
            .Where(ug => ug.GroupId == groupId)
            .Select(ug => ug.UserId)
            .ToListAsync();

        var newMemberIds = request.UserIds.Except(existingMemberIds).ToList();

        foreach (var memberId in newMemberIds)
        {
            var membership = new UserGroup
            {
                GroupId = groupId,
                UserId = memberId,
                Role = request.DefaultRole,
                JoinedAt = DateTime.UtcNow,
                AddedByUserId = currentUserId
            };
            _context.UserGroups.Add(membership);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<GroupRole?> GetUserRoleInGroupAsync(int groupId, string userId)
    {
        return await _context.UserGroups
            .Where(ug => ug.GroupId == groupId && ug.UserId == userId)
            .Select(ug => (GroupRole?)ug.Role)
            .FirstOrDefaultAsync();
    }
}
```

**Frontend Components Implementation**

```typescript
// components/admin/GroupsList.tsx
export const GroupsList: React.FC<GroupsListProps> = ({ onEdit, onDelete, onManageMembers, onViewAnalytics }) => {
  const [search, setSearch] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', search, organizationFilter],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PagedResult<Group>>>('/api/groups', {
        params: { search, organizationId: organizationFilter || undefined }
      });
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => onEdit(undefined)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Crear Grupo
        </button>
      </div>

      {/* Groups grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups?.items.map((group) => (
          <div key={group.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {group.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {group.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{group.memberCount} miembros</span>
              <span>Creado {formatDate(group.createdAt)}</span>
            </div>

            {group.currentUserRole && (
              <div className="mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(group.currentUserRole)}`}>
                  {getRoleLabel(group.currentUserRole)}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => onManageMembers(group.id)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Miembros
              </button>
              <button
                onClick={() => onViewAnalytics(group.id)}
                className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Analíticas
              </button>
              {(group.currentUserRole === GroupRole.Admin || group.currentUserRole === GroupRole.Moderator) && (
                <button
                  onClick={() => onEdit(group)}
                  className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/admin/GroupMembers.tsx
export const GroupMembers: React.FC<GroupMembersProps> = ({ groupId, onClose }) => {
  const [showAddMembers, setShowAddMembers] = useState(false);

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<GroupMember[]>>(`/api/groups/${groupId}/members`);
      return response.data;
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/groups/${groupId}/members`, {
        data: { userIds: [userId] }
      });
    },
    onSuccess: () => {
      refetch();
      toast.success('Miembro removido exitosamente');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: GroupRole }) => {
      await apiClient.put(`/api/groups/${groupId}/members/${userId}/role`, { role });
    },
    onSuccess: () => {
      refetch();
      toast.success('Rol actualizado exitosamente');
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Gestionar Miembros</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-600">
              {members?.data?.length || 0} miembros en total
            </span>
            <button
              onClick={() => setShowAddMembers(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Agregar Miembros
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {members?.data?.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{member.userName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400">
                      Unido el {formatDate(member.joinedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={member.role}
                    onChange={(e) => updateRoleMutation.mutate({
                      userId: member.userId,
                      role: e.target.value as GroupRole
                    })}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value={GroupRole.Member}>Miembro</option>
                    <option value={GroupRole.Moderator}>Moderador</option>
                    <option value={GroupRole.Admin}>Administrador</option>
                  </select>

                  {member.role !== GroupRole.Admin && (
                    <button
                      onClick={() => removeMemberMutation.mutate(member.userId)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAddMembers && (
          <GroupMemberSelector
            groupId={groupId}
            excludeUserIds={members?.data?.map(m => m.userId) || []}
            onAddMembers={async (userIds) => {
              await apiClient.post(`/api/groups/${groupId}/members`, { userIds });
              refetch();
              setShowAddMembers(false);
              toast.success('Miembros agregados exitosamente');
            }}
          />
        )}
      </div>
    </div>
  );
};
```

**AC (Criterios de Aceptación)**

1. **Multi-membresía**: Un usuario puede pertenecer a varios grupos simultáneamente sin restricciones.

2. **Roles jerárquicos**: Sistema de roles (Member < Moderator < Admin) con permisos escalonados para gestión de miembros y configuración.

3. **Filtros en analytics**: Todas las vistas de analíticas permiten filtrar resultados por grupo específico o conjunto de grupos.

4. **Filtros en asignaciones**: Las asignaciones de templates pueden restringirse por grupo, con visibilidad automática para miembros.

5. **Gestión masiva**: Capacidad de agregar/remover múltiples usuarios de un grupo en una sola operación.

6. **Organización opcional**: Soporte para organizaciones empresariales que pueden contener múltiples grupos.

7. **Auditoría de membresía**: Registro de quién agregó a cada miembro y cuándo se unió al grupo.

8. **Búsqueda y filtros**: Interface de administración permite buscar grupos por nombre/descripción y filtrar por organización.

A.5 Planes, créditos y top-ups (negocio)

**Componentes (React + TypeScript)**

```typescript
// PlansList.tsx - Lista de planes de suscripción disponibles
interface PlansListProps {
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: number) => void;
  onViewSubscribers: (planId: number) => void;
}

// PlanEditor.tsx - Formulario para crear/editar planes
interface PlanEditorProps {
  plan?: SubscriptionPlan;
  onSave: (plan: CreatePlanRequest) => Promise<void>;
  onCancel: () => void;
}

// CreditLedgerViewer.tsx - Historial de créditos por usuario
interface CreditLedgerViewerProps {
  userId: string;
  onClose: () => void;
}

// TopUpCreator.tsx - Formulario para agregar créditos a usuarios
interface TopUpCreatorProps {
  userId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// UserCreditsCard.tsx - Tarjeta resumen de créditos del usuario
interface UserCreditsCardProps {
  userId: string;
  showHistory?: boolean;
}

// CreditsPurchaseModal.tsx - Modal para comprar créditos adicionales
interface CreditsPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}
```

**API Endpoints (.NET)**

```csharp
// === SUBSCRIPTION PLANS ===
// GET /api/plans?isActive=true&includeHidden=false
[HttpGet]
public async Task<ActionResult<ApiResponse<List<SubscriptionPlanDto>>>> GetPlans(
    [FromQuery] GetPlansQuery query)

// POST /api/plans
[HttpPost]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<SubscriptionPlanDto>>> CreatePlan(
    [FromBody] CreatePlanRequest request)

// PUT /api/plans/{id}
[HttpPut("{id}")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<SubscriptionPlanDto>>> UpdatePlan(
    int id, [FromBody] UpdatePlanRequest request)

// DELETE /api/plans/{id}
[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<bool>>> DeletePlan(int id)

// === USER SUBSCRIPTIONS ===
// GET /api/users/{userId}/subscription
[HttpGet]
public async Task<ActionResult<ApiResponse<UserSubscriptionDto>>> GetUserSubscription(string userId)

// POST /api/users/{userId}/subscription
[HttpPost]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<UserSubscriptionDto>>> CreateSubscription(
    string userId, [FromBody] CreateSubscriptionRequest request)

// === CREDITS MANAGEMENT ===
// GET /api/users/{userId}/credits
[HttpGet]
public async Task<ActionResult<ApiResponse<UserCreditsDto>>> GetUserCredits(string userId)

// GET /api/users/{userId}/credits/ledger?page=1&pageSize=50
[HttpGet]
public async Task<ActionResult<ApiResponse<PagedResult<CreditLedgerEntryDto>>>> GetCreditLedger(
    string userId, [FromQuery] GetCreditLedgerQuery query)

// POST /api/users/{userId}/credits/topup
[HttpPost]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<CreditTopUpDto>>> CreateTopUp(
    string userId, [FromBody] CreateTopUpRequest request)

// POST /api/users/{userId}/credits/consume
[HttpPost]
public async Task<ActionResult<ApiResponse<CreditLedgerEntryDto>>> ConsumeCredits(
    string userId, [FromBody] ConsumeCreditsRequest request)

// === CREDIT PACKAGES (for purchase) ===
// GET /api/credit-packages
[HttpGet]
public async Task<ActionResult<ApiResponse<List<CreditPackageDto>>>> GetCreditPackages()

// POST /api/credit-packages/{packageId}/purchase
[HttpPost]
public async Task<ActionResult<ApiResponse<PurchaseResultDto>>> PurchaseCreditPackage(
    int packageId, [FromBody] PurchaseRequest request)
```

**Data Models**

```csharp
// SubscriptionPlan entity
public class SubscriptionPlan
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public PlanType Type { get; set; } = PlanType.Monthly;
    public int InterviewCreditsPerPeriod { get; set; }
    public int PracticeCreditsPerPeriod { get; set; } = -1; // -1 = unlimited
    public bool IsActive { get; set; } = true;
    public bool IsHidden { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Features
    public bool HasAnalytics { get; set; } = true;
    public bool HasCertification { get; set; } = true;
    public bool HasPrioritySupport { get; set; } = false;
    public int MaxGroupMemberships { get; set; } = 5;

    public ICollection<UserSubscription> UserSubscriptions { get; set; } = new List<UserSubscription>();
}

// UserSubscription entity
public class UserSubscription
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int PlanId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; }

    // Billing
    public string? ExternalSubscriptionId { get; set; } // Stripe, PayPal, etc.
    public DateTime NextBillingDate { get; set; }
    public decimal CurrentPrice { get; set; }

    // Navigation properties
    public User User { get; set; }
    public SubscriptionPlan Plan { get; set; }
}

// CreditTopUp entity
public class CreditTopUp
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int Credits { get; set; }
    public decimal? AmountPaid { get; set; }
    public string? Currency { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Notes { get; set; }

    // Payment info
    public string? PaymentMethod { get; set; }
    public string? ExternalTransactionId { get; set; }

    // Navigation properties
    public User User { get; set; }
    public User CreatedByUser { get; set; }
    public ICollection<CreditLedgerEntry> LedgerEntries { get; set; } = new List<CreditLedgerEntry>();
}

// CreditLedgerEntry entity - tracks all credit movements
public class CreditLedgerEntry
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public CreditTransactionType Type { get; set; }
    public int CreditsChange { get; set; } // Positive for additions, negative for consumption
    public int BalanceAfter { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }

    // Context
    public string? Description { get; set; }
    public Guid? SessionId { get; set; } // Link to interview/practice session
    public int? TopUpId { get; set; } // Link to top-up if applicable
    public int? SubscriptionId { get; set; } // Link to subscription renewal

    // Navigation properties
    public User User { get; set; }
    public CreditTopUp? TopUp { get; set; }
    public UserSubscription? Subscription { get; set; }
}

// CreditPackage entity - for direct credit purchases
public class CreditPackage
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int Credits { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public int? BonusCredits { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; }
}

// Enums
public enum PlanType
{
    Monthly = 1,
    Yearly = 2,
    Lifetime = 3
}

public enum SubscriptionStatus
{
    Active = 1,
    Cancelled = 2,
    Expired = 3,
    PastDue = 4,
    Paused = 5
}

public enum CreditTransactionType
{
    SubscriptionRenewal = 1,
    TopUpPurchase = 2,
    AdminGrant = 3,
    InterviewConsumption = 4,
    Refund = 5,
    Expiration = 6,
    BonusCredit = 7
}
```

**DTOs y Requests**

```csharp
public class CreatePlanRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; }

    [StringLength(500)]
    public string Description { get; set; }

    [Required, Range(0, 10000)]
    public decimal Price { get; set; }

    public string Currency { get; set; } = "USD";

    public PlanType Type { get; set; }

    [Range(0, 1000)]
    public int InterviewCreditsPerPeriod { get; set; }

    [Range(-1, 10000)] // -1 = unlimited
    public int PracticeCreditsPerPeriod { get; set; } = -1;

    public bool HasAnalytics { get; set; } = true;
    public bool HasCertification { get; set; } = true;
    public bool HasPrioritySupport { get; set; } = false;
    public int MaxGroupMemberships { get; set; } = 5;
}

public class CreateTopUpRequest
{
    [Required, Range(1, 1000)]
    public int Credits { get; set; }

    public DateTime? ExpiresAt { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Range(0, 10000)]
    public decimal? AmountPaid { get; set; }

    public string? PaymentMethod { get; set; }
    public string? ExternalTransactionId { get; set; }
}

public class ConsumeCreditsRequest
{
    [Required, Range(1, 10)]
    public int Credits { get; set; }

    [Required]
    public CreditTransactionType Type { get; set; }

    public Guid? SessionId { get; set; }

    [StringLength(200)]
    public string? Description { get; set; }
}

public class UserCreditsDto
{
    public string UserId { get; set; }
    public int AvailableCredits { get; set; }
    public int ExpiringCredits { get; set; } // Credits expiring in next 30 days
    public DateTime? NextExpirationDate { get; set; }
    public UserSubscriptionDto? CurrentSubscription { get; set; }
    public DateTime? NextRenewalDate { get; set; }
    public int CreditsFromNextRenewal { get; set; }
}

public class CreditLedgerEntryDto
{
    public int Id { get; set; }
    public CreditTransactionType Type { get; set; }
    public string TypeDescription { get; set; }
    public int CreditsChange { get; set; }
    public int BalanceAfter { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? Description { get; set; }
    public Guid? SessionId { get; set; }
}
```

**Business Logic - CreditService**

```csharp
public class CreditService : ICreditService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreditService> _logger;

    public async Task<UserCreditsDto> GetUserCreditsAsync(string userId)
    {
        var now = DateTime.UtcNow;

        // Calculate available credits (non-expired)
        var availableCredits = await _context.CreditLedgerEntries
            .Where(e => e.UserId == userId)
            .Where(e => e.ExpiresAt == null || e.ExpiresAt > now)
            .SumAsync(e => e.CreditsChange);

        // Calculate expiring credits (next 30 days)
        var expiringCredits = await _context.CreditLedgerEntries
            .Where(e => e.UserId == userId)
            .Where(e => e.CreditsChange > 0) // Only positive balances
            .Where(e => e.ExpiresAt != null && e.ExpiresAt > now && e.ExpiresAt <= now.AddDays(30))
            .SumAsync(e => e.CreditsChange);

        // Get next expiration date
        var nextExpirationDate = await _context.CreditLedgerEntries
            .Where(e => e.UserId == userId)
            .Where(e => e.CreditsChange > 0)
            .Where(e => e.ExpiresAt != null && e.ExpiresAt > now)
            .MinAsync(e => (DateTime?)e.ExpiresAt);

        // Get current subscription
        var currentSubscription = await GetCurrentSubscriptionAsync(userId);

        return new UserCreditsDto
        {
            UserId = userId,
            AvailableCredits = Math.Max(0, availableCredits),
            ExpiringCredits = expiringCredits,
            NextExpirationDate = nextExpirationDate,
            CurrentSubscription = currentSubscription,
            NextRenewalDate = currentSubscription?.NextBillingDate,
            CreditsFromNextRenewal = currentSubscription?.Plan?.InterviewCreditsPerPeriod ?? 0
        };
    }

    public async Task<bool> ConsumeCreditsAsync(string userId, ConsumeCreditsRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var currentCredits = await GetAvailableCreditsAsync(userId);

            if (currentCredits < request.Credits)
            {
                throw new InsufficientCreditsException($"User has {currentCredits} credits but needs {request.Credits}");
            }

            var newBalance = currentCredits - request.Credits;

            var ledgerEntry = new CreditLedgerEntry
            {
                UserId = userId,
                Type = request.Type,
                CreditsChange = -request.Credits,
                BalanceAfter = newBalance,
                CreatedAt = DateTime.UtcNow,
                Description = request.Description,
                SessionId = request.SessionId
            };

            _context.CreditLedgerEntries.Add(ledgerEntry);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation("Credits consumed: User {UserId}, Amount {Credits}, New Balance {Balance}",
                userId, request.Credits, newBalance);

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<CreditTopUpDto> CreateTopUpAsync(string userId, CreateTopUpRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var currentCredits = await GetAvailableCreditsAsync(userId);
            var currentUserId = _currentUserService.UserId;

            var topUp = new CreditTopUp
            {
                UserId = userId,
                Credits = request.Credits,
                AmountPaid = request.AmountPaid,
                Currency = "USD",
                ExpiresAt = request.ExpiresAt,
                CreatedByUserId = currentUserId,
                CreatedAt = DateTime.UtcNow,
                Notes = request.Notes,
                PaymentMethod = request.PaymentMethod,
                ExternalTransactionId = request.ExternalTransactionId
            };

            _context.CreditTopUps.Add(topUp);
            await _context.SaveChangesAsync();

            var newBalance = currentCredits + request.Credits;

            var ledgerEntry = new CreditLedgerEntry
            {
                UserId = userId,
                Type = request.AmountPaid.HasValue ? CreditTransactionType.TopUpPurchase : CreditTransactionType.AdminGrant,
                CreditsChange = request.Credits,
                BalanceAfter = newBalance,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt,
                Description = request.Notes ?? "Credit top-up",
                TopUpId = topUp.Id
            };

            _context.CreditLedgerEntries.Add(ledgerEntry);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            _logger.LogInformation("Credits added: User {UserId}, Amount {Credits}, New Balance {Balance}",
                userId, request.Credits, newBalance);

            return await GetTopUpByIdAsync(topUp.Id);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task ProcessSubscriptionRenewalAsync(string userId, int subscriptionId)
    {
        var subscription = await _context.UserSubscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.UserId == userId);

        if (subscription?.Plan == null)
            throw new NotFoundException("Subscription not found");

        var currentCredits = await GetAvailableCreditsAsync(userId);
        var creditsToAdd = subscription.Plan.InterviewCreditsPerPeriod;
        var newBalance = currentCredits + creditsToAdd;

        // Set expiration based on plan type
        DateTime? expiresAt = subscription.Plan.Type switch
        {
            PlanType.Monthly => DateTime.UtcNow.AddMonths(1),
            PlanType.Yearly => DateTime.UtcNow.AddYears(1),
            PlanType.Lifetime => null,
            _ => DateTime.UtcNow.AddMonths(1)
        };

        var ledgerEntry = new CreditLedgerEntry
        {
            UserId = userId,
            Type = CreditTransactionType.SubscriptionRenewal,
            CreditsChange = creditsToAdd,
            BalanceAfter = newBalance,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            Description = $"Subscription renewal: {subscription.Plan.Name}",
            SubscriptionId = subscriptionId
        };

        _context.CreditLedgerEntries.Add(ledgerEntry);

        // Update next billing date
        subscription.NextBillingDate = subscription.Plan.Type switch
        {
            PlanType.Monthly => subscription.NextBillingDate.AddMonths(1),
            PlanType.Yearly => subscription.NextBillingDate.AddYears(1),
            PlanType.Lifetime => DateTime.MaxValue,
            _ => subscription.NextBillingDate.AddMonths(1)
        };

        await _context.SaveChangesAsync();

        _logger.LogInformation("Subscription renewed: User {UserId}, Plan {PlanName}, Credits Added {Credits}",
            userId, subscription.Plan.Name, creditsToAdd);
    }

    private async Task<int> GetAvailableCreditsAsync(string userId)
    {
        var now = DateTime.UtcNow;
        var credits = await _context.CreditLedgerEntries
            .Where(e => e.UserId == userId)
            .Where(e => e.ExpiresAt == null || e.ExpiresAt > now)
            .SumAsync(e => e.CreditsChange);

        return Math.Max(0, credits);
    }
}

// Custom exception
public class InsufficientCreditsException : Exception
{
    public InsufficientCreditsException(string message) : base(message) { }
}
```

**Frontend Components Implementation**

```typescript
// hooks/useUserCredits.ts
export const useUserCredits = (userId: string) => {
  return useQuery({
    queryKey: ['user-credits', userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserCredits>>(`/api/users/${userId}/credits`);
      return response.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};

// components/admin/UserCreditsCard.tsx
export const UserCreditsCard: React.FC<UserCreditsCardProps> = ({ userId, showHistory = false }) => {
  const { data: credits, isLoading, refetch } = useUserCredits(userId);
  const [showLedger, setShowLedger] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  if (isLoading) return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Créditos</h3>
        <div className="flex gap-2">
          {showHistory && (
            <button
              onClick={() => setShowLedger(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Ver Historial
            </button>
          )}
          <button
            onClick={() => setShowTopUp(true)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Agregar Créditos
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Créditos disponibles</span>
          <span className="text-2xl font-bold text-green-600">
            {credits?.data.availableCredits || 0}
          </span>
        </div>

        {(credits?.data.expiringCredits || 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {credits.data.expiringCredits} créditos expiran el {formatDate(credits.data.nextExpirationDate)}
              </span>
            </div>
          </div>
        )}

        {credits?.data.currentSubscription && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Plan actual</span>
              <span className="text-sm font-medium text-gray-900">
                {credits.data.currentSubscription.planName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Próxima renovación</span>
              <span className="text-sm text-gray-900">
                {formatDate(credits.data.nextRenewalDate)} (+{credits.data.creditsFromNextRenewal} créditos)
              </span>
            </div>
          </div>
        )}

        {!credits?.data.currentSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Sin plan activo</span>
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                Ver Planes
              </button>
            </div>
          </div>
        )}
      </div>

      {showLedger && (
        <CreditLedgerViewer userId={userId} onClose={() => setShowLedger(false)} />
      )}

      {showTopUp && (
        <TopUpCreator
          userId={userId}
          onSuccess={() => {
            setShowTopUp(false);
            refetch();
          }}
          onCancel={() => setShowTopUp(false)}
        />
      )}
    </div>
  );
};

// components/student/CreditsPurchaseModal.tsx
export const CreditsPurchaseModal: React.FC<CreditsPurchaseModalProps> = ({ isOpen, onClose, onPurchaseComplete }) => {
  const { data: packages } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CreditPackage[]>>('/api/credit-packages');
      return response.data;
    },
    enabled: isOpen
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: number) => {
      const response = await apiClient.post<ApiResponse<PurchaseResult>>(`/api/credit-packages/${packageId}/purchase`);
      return response.data;
    },
    onSuccess: () => {
      onPurchaseComplete();
      toast.success('Créditos comprados exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al procesar la compra');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Comprar Créditos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {packages?.data?.map((pkg) => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-blue-600">{pkg.credits} créditos</span>
                    {pkg.bonusCredits > 0 && (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        +{pkg.bonusCredits} bonus
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">${pkg.price}</div>
                  <button
                    onClick={() => purchaseMutation.mutate(pkg.id)}
                    disabled={purchaseMutation.isPending}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {purchaseMutation.isPending ? 'Procesando...' : 'Comprar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Los créditos no expiran y se pueden usar para entrevistas en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  );
};
```

**AC (Criterios de Aceptación)**

1. **Consumo de créditos**: Cada entrevista consume exactamente 1 crédito al momento de iniciar la sesión.

2. **Manejo de créditos insuficientes**: Sin créditos disponibles ⇒ Error 402 (Payment Required) con CTA para comprar top-up o suscribirse.

3. **Renovación automática**: Las suscripciones entregan X créditos por período según el plan, con fechas de vencimiento apropiadas.

4. **Top-ups flexibles**: Los administradores pueden agregar créditos manualmente con fecha de vencimiento configurable.

5. **Histórial completo**: El ledger de créditos registra todas las transacciones (renovaciones, consumos, top-ups, expiraciones).

6. **Expiración de créditos**: Sistema maneja créditos con vencimiento y notifica cuando están próximos a expirar.

7. **Compra directa**: Los estudiantes pueden comprar paquetes de créditos sin necesidad de suscripción.

8. **Auditoría financiera**: Registro completo de pagos, transacciones externas y métodos de pago para reconciliación contable.

A.6 Proctoring y certificados (solo entrevistas)

**Componentes (React + TypeScript)**

```typescript
// ProctoringPolicyForm.tsx - Configuración de políticas de integridad por template
interface ProctoringPolicyFormProps {
  templateId: number;
  currentPolicy: ProctoringPolicy;
  onSave: (policy: UpdateProctoringPolicyRequest) => Promise<void>;
  onCancel: () => void;
}

// IntegrityMonitor.tsx - Monitor en tiempo real durante entrevistas
interface IntegrityMonitorProps {
  sessionId: string;
  onViolationDetected: (violation: IntegrityViolation) => void;
  settings: ProctoringSettings;
}

// CertificateTemplateEditor.tsx - Editor de plantillas de certificados
interface CertificateTemplateEditorProps {
  template?: CertificateTemplate;
  onSave: (template: CreateCertificateTemplateRequest) => Promise<void>;
  onCancel: () => void;
}

// CertificateViewer.tsx - Visor y descarga de certificados
interface CertificateViewerProps {
  sessionId: string;
  onClose: () => void;
}

// SessionIntegrityReport.tsx - Reporte de eventos de integridad
interface SessionIntegrityReportProps {
  sessionId: string;
  showDetails?: boolean;
}

// IntegrityViolationsTable.tsx - Tabla de violaciones en admin
interface IntegrityViolationsTableProps {
  filters?: {
    sessionId?: string;
    userId?: string;
    violationType?: IntegrityViolationType;
    dateRange?: [Date, Date];
  };
}
```

**API Endpoints (.NET)**

```csharp
// === PROCTORING POLICIES ===
// GET /api/templates/{templateId}/integrity
[HttpGet]
public async Task<ActionResult<ApiResponse<ProctoringPolicyDto>>> GetProctoringPolicy(int templateId)

// PUT /api/templates/{templateId}/integrity
[HttpPut]
[Authorize(Roles = "Admin,Editor")]
public async Task<ActionResult<ApiResponse<ProctoringPolicyDto>>> UpdateProctoringPolicy(
    int templateId, [FromBody] UpdateProctoringPolicyRequest request)

// === INTEGRITY MONITORING ===
// POST /api/interviews/{sessionId}/integrity-events
[HttpPost]
public async Task<ActionResult<ApiResponse<IntegrityEventDto>>> RecordIntegrityEvent(
    string sessionId, [FromBody] RecordIntegrityEventRequest request)

// GET /api/interviews/{sessionId}/integrity-events
[HttpGet]
public async Task<ActionResult<ApiResponse<List<IntegrityEventDto>>>> GetIntegrityEvents(string sessionId)

// GET /api/integrity-events?userId=&violationType=&fromDate=&toDate=&page=1&pageSize=50
[HttpGet]
public async Task<ActionResult<ApiResponse<PagedResult<IntegrityEventDto>>>> GetIntegrityEvents(
    [FromQuery] GetIntegrityEventsQuery query)

// === CERTIFICATES ===
// GET /api/interviews/{sessionId}/certificate
[HttpGet]
public async Task<ActionResult<ApiResponse<CertificateDto>>> GetSessionCertificate(string sessionId)

// POST /api/interviews/{sessionId}/certificate/generate
[HttpPost]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<CertificateDto>>> GenerateCertificate(string sessionId)

// GET /api/certificates/{certificateId}/verify
[HttpGet]
[AllowAnonymous]
public async Task<ActionResult<ApiResponse<CertificateVerificationDto>>> VerifyCertificate(string certificateId)

// GET /api/certificates/{certificateId}/download
[HttpGet]
[AllowAnonymous]
public async Task<IActionResult> DownloadCertificate(string certificateId)

// === CERTIFICATE TEMPLATES ===
// GET /api/certificate-templates
[HttpGet]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<List<CertificateTemplateDto>>>> GetCertificateTemplates()

// POST /api/certificate-templates
[HttpPost]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<CertificateTemplateDto>>> CreateCertificateTemplate(
    [FromBody] CreateCertificateTemplateRequest request)

// PUT /api/certificate-templates/{id}
[HttpPut("{id}")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<ApiResponse<CertificateTemplateDto>>> UpdateCertificateTemplate(
    int id, [FromBody] UpdateCertificateTemplateRequest request)
```

**Data Models**

```csharp
// ProctoringPolicy entity - extends SessionTemplate
public class ProctoringPolicy
{
    public int Id { get; set; }
    public int TemplateId { get; set; }

    // Fullscreen requirements
    public bool RequireFullscreen { get; set; } = false;
    public int MaxFullscreenViolations { get; set; } = 3;
    public bool AutoSubmitOnFullscreenViolations { get; set; } = false;

    // Focus monitoring
    public bool TrackFocusLoss { get; set; } = true;
    public int MaxFocusLossViolations { get; set; } = 5;
    public bool AutoSubmitOnFocusViolations { get; set; } = false;

    // Copy/paste restrictions
    public bool BlockCopyPaste { get; set; } = false;
    public bool TrackCopyPasteAttempts { get; set; } = true;

    // Tab switching
    public bool TrackTabSwitching { get; set; } = true;
    public int MaxTabSwitchViolations { get; set; } = 3;

    // Right-click and developer tools
    public bool BlockRightClick { get; set; } = false;
    public bool BlockDevTools { get; set; } = true;

    // Screen recording/screenshot detection
    public bool DetectScreenRecording { get; set; } = false;
    public bool WarnOnScreenRecording { get; set; } = true;

    // Navigation restrictions
    public bool BlockNavigation { get; set; } = true;
    public bool AllowRefresh { get; set; } = false;

    // Timing
    public int ViolationGracePeriodSec { get; set; } = 10;

    // Actions
    public bool EmailNotifyOnViolations { get; set; } = true;
    public string? ViolationNotificationEmails { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public SessionTemplate Template { get; set; }
    public ICollection<IntegrityEvent> IntegrityEvents { get; set; } = new List<IntegrityEvent>();
}

// IntegrityEvent entity - tracks all integrity violations
public class IntegrityEvent
{
    public int Id { get; set; }
    public string SessionId { get; set; }
    public string UserId { get; set; }
    public IntegrityViolationType Type { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Details { get; set; } // JSON metadata
    public int ViolationCount { get; set; } // Running count for this violation type
    public bool WasWarningShown { get; set; } = false;
    public bool CausedAutoSubmit { get; set; } = false;

    // Browser/environment info
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public string? WindowSize { get; set; }
    public string? ScreenSize { get; set; }

    // Navigation properties
    public InterviewSession Session { get; set; }
    public User User { get; set; }
}

// InterviewCertificate entity
public class InterviewCertificate
{
    public int Id { get; set; }
    public string CertificateId { get; set; } = Guid.NewGuid().ToString(); // Public ID for verification
    public string SessionId { get; set; }
    public string UserId { get; set; }
    public int? TemplateId { get; set; }

    // Certificate content
    public string UserName { get; set; }
    public string TemplateName { get; set; }
    public int TotalScore { get; set; }
    public int MaxScore { get; set; }
    public double ScorePercentage { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }

    // Topics and performance
    public string TopicsJson { get; set; } // Serialized topic scores
    public string SkillsAssessedJson { get; set; } // Skills demonstrated

    // Integrity information
    public bool HasIntegrityViolations { get; set; }
    public int IntegrityViolationsCount { get; set; }
    public string? IntegrityNotes { get; set; }

    // Metadata
    public DateTime IssuedAt { get; set; }
    public string IssuedByUserId { get; set; }
    public bool IsValid { get; set; } = true;
    public DateTime? RevokedAt { get; set; }
    public string? RevocationReason { get; set; }

    // File information
    public string? PdfFileName { get; set; }
    public string? PdfFilePath { get; set; }
    public long? PdfFileSize { get; set; }

    // Verification
    public string VerificationHash { get; set; } // Hash for tamper detection
    public string VerificationUrl { get; set; }
    public string QrCodeData { get; set; }

    // Navigation properties
    public InterviewSession Session { get; set; }
    public User User { get; set; }
    public User IssuedByUser { get; set; }
    public CertificateTemplate? Template { get; set; }
}

// CertificateTemplate entity
public class CertificateTemplate
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsDefault { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // Template configuration
    public string HeaderHtml { get; set; } // HTML template for header
    public string BodyHtml { get; set; } // HTML template for body
    public string FooterHtml { get; set; } // HTML template for footer
    public string CssStyles { get; set; } // Custom CSS

    // Colors and branding
    public string PrimaryColor { get; set; } = "#1E40AF";
    public string SecondaryColor { get; set; } = "#64748B";
    public string LogoUrl { get; set; }
    public string CompanyName { get; set; } = "TechPrep";

    // Layout settings
    public string PageSize { get; set; } = "A4"; // A4, Letter, etc.
    public string Orientation { get; set; } = "Portrait"; // Portrait, Landscape
    public string FontFamily { get; set; } = "Arial, sans-serif";

    // Content settings
    public bool ShowScore { get; set; } = true;
    public bool ShowDuration { get; set; } = true;
    public bool ShowTopicBreakdown { get; set; } = true;
    public bool ShowIntegrityStatus { get; set; } = true;
    public bool ShowQrCode { get; set; } = true;
    public bool ShowVerificationUrl { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<InterviewCertificate> Certificates { get; set; } = new List<InterviewCertificate>();
}

// Enums
public enum IntegrityViolationType
{
    FocusLoss = 1,
    FullscreenExit = 2,
    TabSwitch = 3,
    CopyAttempt = 4,
    PasteAttempt = 5,
    RightClick = 6,
    DevToolsOpen = 7,
    NavigationAttempt = 8,
    ScreenRecordingDetected = 9,
    MultipleWindows = 10,
    SuspiciousActivity = 11
}
```

**DTOs y Requests**

```csharp
public class UpdateProctoringPolicyRequest
{
    public bool RequireFullscreen { get; set; } = false;
    public int MaxFullscreenViolations { get; set; } = 3;
    public bool AutoSubmitOnFullscreenViolations { get; set; } = false;

    public bool TrackFocusLoss { get; set; } = true;
    public int MaxFocusLossViolations { get; set; } = 5;
    public bool AutoSubmitOnFocusViolations { get; set; } = false;

    public bool BlockCopyPaste { get; set; } = false;
    public bool TrackCopyPasteAttempts { get; set; } = true;

    public bool TrackTabSwitching { get; set; } = true;
    public int MaxTabSwitchViolations { get; set; } = 3;

    public bool BlockRightClick { get; set; } = false;
    public bool BlockDevTools { get; set; } = true;

    public bool DetectScreenRecording { get; set; } = false;
    public bool WarnOnScreenRecording { get; set; } = true;

    public bool BlockNavigation { get; set; } = true;
    public bool AllowRefresh { get; set; } = false;

    public int ViolationGracePeriodSec { get; set; } = 10;

    public bool EmailNotifyOnViolations { get; set; } = true;
    public string? ViolationNotificationEmails { get; set; }
}

public class RecordIntegrityEventRequest
{
    [Required]
    public IntegrityViolationType Type { get; set; }

    public string? Details { get; set; }
    public string? UserAgent { get; set; }
    public string? WindowSize { get; set; }
    public string? ScreenSize { get; set; }
}

public class CreateCertificateTemplateRequest
{
    [Required, StringLength(100)]
    public string Name { get; set; }

    [StringLength(500)]
    public string Description { get; set; }

    public string HeaderHtml { get; set; }
    public string BodyHtml { get; set; }
    public string FooterHtml { get; set; }
    public string CssStyles { get; set; }

    public string PrimaryColor { get; set; } = "#1E40AF";
    public string SecondaryColor { get; set; } = "#64748B";
    public string LogoUrl { get; set; }
    public string CompanyName { get; set; } = "TechPrep";

    public bool ShowScore { get; set; } = true;
    public bool ShowDuration { get; set; } = true;
    public bool ShowTopicBreakdown { get; set; } = true;
    public bool ShowIntegrityStatus { get; set; } = true;
    public bool ShowQrCode { get; set; } = true;
    public bool ShowVerificationUrl { get; set; } = true;
}

public class CertificateDto
{
    public string CertificateId { get; set; }
    public string UserName { get; set; }
    public string TemplateName { get; set; }
    public int TotalScore { get; set; }
    public int MaxScore { get; set; }
    public double ScorePercentage { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
    public bool HasIntegrityViolations { get; set; }
    public int IntegrityViolationsCount { get; set; }
    public DateTime IssuedAt { get; set; }
    public string VerificationUrl { get; set; }
    public string QrCodeData { get; set; }
    public bool IsValid { get; set; }
    public string? DownloadUrl { get; set; }
}

public class CertificateVerificationDto
{
    public string CertificateId { get; set; }
    public bool IsValid { get; set; }
    public string UserName { get; set; }
    public string TemplateName { get; set; }
    public DateTime CompletedAt { get; set; }
    public DateTime IssuedAt { get; set; }
    public double ScorePercentage { get; set; }
    public bool HasIntegrityViolations { get; set; }
    public string? RevocationReason { get; set; }
    public DateTime? RevokedAt { get; set; }
}

public class IntegrityEventDto
{
    public int Id { get; set; }
    public IntegrityViolationType Type { get; set; }
    public string TypeDescription { get; set; }
    public DateTime Timestamp { get; set; }
    public string? Details { get; set; }
    public int ViolationCount { get; set; }
    public bool WasWarningShown { get; set; }
    public bool CausedAutoSubmit { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
}
```

**Business Logic - ProctoringService**

```csharp
public class ProctoringService : IProctoringService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProctoringService> _logger;
    private readonly IEmailService _emailService;

    public async Task<IntegrityEventDto> RecordIntegrityEventAsync(string sessionId, RecordIntegrityEventRequest request)
    {
        var session = await _context.InterviewSessions
            .Include(s => s.Template)
            .ThenInclude(t => t.ProctoringPolicy)
            .FirstOrDefaultAsync(s => s.Id.ToString() == sessionId);

        if (session?.Template?.ProctoringPolicy == null)
            throw new NotFoundException("Session or proctoring policy not found");

        var policy = session.Template.ProctoringPolicy;

        // Count existing violations of this type
        var existingViolations = await _context.IntegrityEvents
            .Where(e => e.SessionId == sessionId && e.Type == request.Type)
            .CountAsync();

        var violationCount = existingViolations + 1;

        // Determine if auto-submit should occur
        var shouldAutoSubmit = request.Type switch
        {
            IntegrityViolationType.FocusLoss =>
                policy.AutoSubmitOnFocusViolations && violationCount >= policy.MaxFocusLossViolations,
            IntegrityViolationType.FullscreenExit =>
                policy.AutoSubmitOnFullscreenViolations && violationCount >= policy.MaxFullscreenViolations,
            IntegrityViolationType.TabSwitch =>
                violationCount >= policy.MaxTabSwitchViolations,
            _ => false
        };

        var integrityEvent = new IntegrityEvent
        {
            SessionId = sessionId,
            UserId = session.UserId,
            Type = request.Type,
            Timestamp = DateTime.UtcNow,
            Details = request.Details,
            ViolationCount = violationCount,
            WasWarningShown = ShouldShowWarning(request.Type, violationCount, policy),
            CausedAutoSubmit = shouldAutoSubmit,
            UserAgent = request.UserAgent,
            IpAddress = GetClientIpAddress(),
            WindowSize = request.WindowSize,
            ScreenSize = request.ScreenSize
        };

        _context.IntegrityEvents.Add(integrityEvent);

        // Auto-submit session if needed
        if (shouldAutoSubmit && session.Status == SessionStatus.InProgress)
        {
            session.Status = SessionStatus.AutoSubmitted;
            session.FinishedAt = DateTime.UtcNow;

            _logger.LogWarning("Session auto-submitted due to integrity violations: {SessionId}, Type: {ViolationType}, Count: {Count}",
                sessionId, request.Type, violationCount);
        }

        await _context.SaveChangesAsync();

        // Send email notification if configured
        if (policy.EmailNotifyOnViolations && !string.IsNullOrEmpty(policy.ViolationNotificationEmails))
        {
            await SendViolationNotificationAsync(session, integrityEvent, policy);
        }

        return new IntegrityEventDto
        {
            Id = integrityEvent.Id,
            Type = integrityEvent.Type,
            TypeDescription = GetViolationTypeDescription(integrityEvent.Type),
            Timestamp = integrityEvent.Timestamp,
            Details = integrityEvent.Details,
            ViolationCount = integrityEvent.ViolationCount,
            WasWarningShown = integrityEvent.WasWarningShown,
            CausedAutoSubmit = integrityEvent.CausedAutoSubmit,
            UserAgent = integrityEvent.UserAgent,
            IpAddress = integrityEvent.IpAddress
        };
    }

    private bool ShouldShowWarning(IntegrityViolationType type, int count, ProctoringPolicy policy)
    {
        return type switch
        {
            IntegrityViolationType.FocusLoss => count >= policy.MaxFocusLossViolations - 1,
            IntegrityViolationType.FullscreenExit => count >= policy.MaxFullscreenViolations - 1,
            IntegrityViolationType.TabSwitch => count >= policy.MaxTabSwitchViolations - 1,
            _ => count >= 2
        };
    }

    private async Task SendViolationNotificationAsync(InterviewSession session, IntegrityEvent violation, ProctoringPolicy policy)
    {
        var emails = policy.ViolationNotificationEmails.Split(',', StringSplitOptions.RemoveEmptyEntries);

        var subject = $"Integrity Violation Alert - {session.Template.Name}";
        var body = $@"
            An integrity violation has been detected:

            User: {session.User.FirstName} {session.User.LastName} ({session.User.Email})
            Session: {session.Id}
            Template: {session.Template.Name}
            Violation Type: {GetViolationTypeDescription(violation.Type)}
            Violation Count: {violation.ViolationCount}
            Timestamp: {violation.Timestamp:yyyy-MM-dd HH:mm:ss UTC}

            {(violation.CausedAutoSubmit ? "⚠️ Session was automatically submitted due to this violation." : "")}
        ";

        foreach (var email in emails)
        {
            await _emailService.SendEmailAsync(email.Trim(), subject, body);
        }
    }

    private string GetViolationTypeDescription(IntegrityViolationType type)
    {
        return type switch
        {
            IntegrityViolationType.FocusLoss => "Lost window focus",
            IntegrityViolationType.FullscreenExit => "Exited fullscreen mode",
            IntegrityViolationType.TabSwitch => "Switched browser tab",
            IntegrityViolationType.CopyAttempt => "Attempted to copy content",
            IntegrityViolationType.PasteAttempt => "Attempted to paste content",
            IntegrityViolationType.RightClick => "Right-clicked (context menu)",
            IntegrityViolationType.DevToolsOpen => "Opened developer tools",
            IntegrityViolationType.NavigationAttempt => "Attempted navigation",
            IntegrityViolationType.ScreenRecordingDetected => "Screen recording detected",
            IntegrityViolationType.MultipleWindows => "Multiple windows detected",
            IntegrityViolationType.SuspiciousActivity => "Suspicious activity detected",
            _ => "Unknown violation"
        };
    }
}
```

**Frontend Components Implementation**

```typescript
// components/interview/IntegrityMonitor.tsx
export const IntegrityMonitor: React.FC<IntegrityMonitorProps> = ({ sessionId, onViolationDetected, settings }) => {
  const recordViolation = useMutation({
    mutationFn: async (violation: RecordIntegrityEventRequest) => {
      const response = await apiClient.post<ApiResponse<IntegrityEvent>>(
        `/api/interviews/${sessionId}/integrity-events`,
        violation
      );
      return response.data;
    },
    onSuccess: (data) => {
      onViolationDetected(data.data);
    }
  });

  useEffect(() => {
    const handlers: (() => void)[] = [];

    // Focus monitoring
    if (settings.trackFocusLoss) {
      const handleBlur = () => {
        recordViolation.mutate({
          type: IntegrityViolationType.FocusLoss,
          details: 'Window lost focus',
          userAgent: navigator.userAgent,
          windowSize: `${window.innerWidth}x${window.innerHeight}`,
          screenSize: `${screen.width}x${screen.height}`
        });
      };

      window.addEventListener('blur', handleBlur);
      handlers.push(() => window.removeEventListener('blur', handleBlur));
    }

    // Fullscreen monitoring
    if (settings.requireFullscreen) {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          recordViolation.mutate({
            type: IntegrityViolationType.FullscreenExit,
            details: 'Exited fullscreen mode',
            userAgent: navigator.userAgent
          });
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      handlers.push(() => document.removeEventListener('fullscreenchange', handleFullscreenChange));
    }

    // Copy/paste monitoring
    if (settings.trackCopyPasteAttempts) {
      const handleCopy = (e: ClipboardEvent) => {
        if (settings.blockCopyPaste) {
          e.preventDefault();
        }
        recordViolation.mutate({
          type: IntegrityViolationType.CopyAttempt,
          details: 'Attempted to copy content'
        });
      };

      const handlePaste = (e: ClipboardEvent) => {
        if (settings.blockCopyPaste) {
          e.preventDefault();
        }
        recordViolation.mutate({
          type: IntegrityViolationType.PasteAttempt,
          details: 'Attempted to paste content'
        });
      };

      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      handlers.push(() => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
      });
    }

    // Right-click monitoring
    if (settings.blockRightClick || settings.trackRightClick) {
      const handleContextMenu = (e: MouseEvent) => {
        if (settings.blockRightClick) {
          e.preventDefault();
        }
        recordViolation.mutate({
          type: IntegrityViolationType.RightClick,
          details: 'Right-clicked to open context menu'
        });
      };

      document.addEventListener('contextmenu', handleContextMenu);
      handlers.push(() => document.removeEventListener('contextmenu', handleContextMenu));
    }

    // Developer tools detection
    if (settings.blockDevTools) {
      let devtools = false;
      const threshold = 160;

      const detectDevTools = () => {
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools) {
            devtools = true;
            recordViolation.mutate({
              type: IntegrityViolationType.DevToolsOpen,
              details: 'Developer tools detected as open'
            });
          }
        } else {
          devtools = false;
        }
      };

      const interval = setInterval(detectDevTools, 1000);
      handlers.push(() => clearInterval(interval));
    }

    // Navigation blocking
    if (settings.blockNavigation) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        recordViolation.mutate({
          type: IntegrityViolationType.NavigationAttempt,
          details: 'Attempted to navigate away from the page'
        });
        return '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      handlers.push(() => window.removeEventListener('beforeunload', handleBeforeUnload));
    }

    // Tab visibility monitoring
    if (settings.trackTabSwitching) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          recordViolation.mutate({
            type: IntegrityViolationType.TabSwitch,
            details: 'Tab became hidden (switched to another tab)'
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      handlers.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
    }

    return () => {
      handlers.forEach(cleanup => cleanup());
    };
  }, [sessionId, settings, recordViolation]);

  return null; // This component has no visual output, it's just monitoring
};

// components/admin/ProctoringPolicyForm.tsx
export const ProctoringPolicyForm: React.FC<ProctoringPolicyFormProps> = ({ templateId, currentPolicy, onSave, onCancel }) => {
  const [policy, setPolicy] = useState<UpdateProctoringPolicyRequest>(currentPolicy);

  const updateMutation = useMutation({
    mutationFn: async (updatedPolicy: UpdateProctoringPolicyRequest) => {
      await apiClient.put(`/api/templates/${templateId}/integrity`, updatedPolicy);
    },
    onSuccess: () => {
      toast.success('Política de integridad actualizada exitosamente');
      onCancel();
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Configuración de Integridad</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Estas configuraciones solo se aplican a entrevistas. Las sesiones de práctica no tienen restricciones de integridad.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fullscreen Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pantalla Completa</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.requireFullscreen}
                onChange={(e) => setPolicy(prev => ({ ...prev, requireFullscreen: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Requerir pantalla completa</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de salidas de pantalla completa
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.maxFullscreenViolations}
                onChange={(e) => setPolicy(prev => ({ ...prev, maxFullscreenViolations: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.autoSubmitOnFullscreenViolations}
                onChange={(e) => setPolicy(prev => ({ ...prev, autoSubmitOnFullscreenViolations: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Auto-enviar al exceder el límite</span>
            </label>
          </div>
        </div>

        {/* Focus Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pérdida de Enfoque</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.trackFocusLoss}
                onChange={(e) => setPolicy(prev => ({ ...prev, trackFocusLoss: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Rastrear pérdida de enfoque</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de pérdidas de enfoque
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={policy.maxFocusLossViolations}
                onChange={(e) => setPolicy(prev => ({ ...prev, maxFocusLossViolations: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.autoSubmitOnFocusViolations}
                onChange={(e) => setPolicy(prev => ({ ...prev, autoSubmitOnFocusViolations: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Auto-enviar al exceder el límite</span>
            </label>
          </div>
        </div>

        {/* Copy/Paste Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Copiar/Pegar</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.blockCopyPaste}
                onChange={(e) => setPolicy(prev => ({ ...prev, blockCopyPaste: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Bloquear copiar/pegar</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.trackCopyPasteAttempts}
                onChange={(e) => setPolicy(prev => ({ ...prev, trackCopyPasteAttempts: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Rastrear intentos de copiar/pegar</span>
            </label>
          </div>
        </div>

        {/* Other Security Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Otras Restricciones</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.blockRightClick}
                onChange={(e) => setPolicy(prev => ({ ...prev, blockRightClick: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Bloquear clic derecho</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.blockDevTools}
                onChange={(e) => setPolicy(prev => ({ ...prev, blockDevTools: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Detectar herramientas de desarrollador</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.trackTabSwitching}
                onChange={(e) => setPolicy(prev => ({ ...prev, trackTabSwitching: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Rastrear cambio de pestañas</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.blockNavigation}
                onChange={(e) => setPolicy(prev => ({ ...prev, blockNavigation: e.target.checked }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Bloquear navegación</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={policy.emailNotifyOnViolations}
              onChange={(e) => setPolicy(prev => ({ ...prev, emailNotifyOnViolations: e.target.checked }))}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Enviar notificaciones por email</span>
          </label>

          {policy.emailNotifyOnViolations && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emails de notificación (separados por comas)
              </label>
              <input
                type="text"
                placeholder="admin@company.com, security@company.com"
                value={policy.violationNotificationEmails || ''}
                onChange={(e) => setPolicy(prev => ({ ...prev, violationNotificationEmails: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => updateMutation.mutate(policy)}
          disabled={updateMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};
```

**AC (Criterios de Aceptación)**

1. **Registro de eventos**: Todos los eventos de integridad (focus, fullscreen, copy, paste, tab switch, etc.) se registran en tiempo real con timestamps y metadatos.

2. **Auto-envío configurable**: Las sesiones pueden configurarse para auto-enviarse automáticamente cuando se exceden los límites de violaciones.

3. **Certificados únicos**: Cada certificado tiene un ID único, hash de verificación, URL verificable y código QR para autenticación.

4. **Plantillas personalizables**: Sistema de plantillas HTML/CSS para personalizar el diseño y contenido de los certificados.

5. **Verificación pública**: URL pública `/certificates/{id}/verify` permite verificar autenticidad sin autenticación.

6. **Notificaciones en tiempo real**: Alertas automáticas por email a administradores cuando ocurren violaciones de integridad.

7. **Descarga segura**: Los certificados PDF se generan dinámicamente y incluyen información de integridad y scores por tema.

8. **Revocación de certificados**: Capacidad administrativa para revocar certificados con razón y timestamp de revocación.

A.7 Analítica y reportes

**Componentes (React + TypeScript)**

```typescript
// AnalyticsDashboard.tsx - Dashboard principal con métricas generales
interface AnalyticsDashboardProps {
  timeRange: TimeRange;
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

// TemplateAnalytics.tsx - Analíticas específicas por template
interface TemplateAnalyticsProps {
  templateId: number;
  timeRange: TimeRange;
  compareMode?: 'none' | 'previous-period' | 'baseline';
}

// GroupAnalytics.tsx - Analíticas específicas por grupo
interface GroupAnalyticsProps {
  groupId: number;
  timeRange: TimeRange;
  includeSubgroups?: boolean;
}

// UserAnalytics.tsx - Analíticas específicas por usuario
interface UserAnalyticsProps {
  userId: string;
  timeRange: TimeRange;
  showPersonalGoals?: boolean;
}

// PerformanceChart.tsx - Gráficos de rendimiento
interface PerformanceChartProps {
  data: PerformanceData[];
  type: 'line' | 'bar' | 'area' | 'pie';
  metric: 'score' | 'completion' | 'time' | 'violations';
  groupBy: 'day' | 'week' | 'month' | 'topic' | 'level';
}

// MetricsCard.tsx - Tarjeta de métrica individual
interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  format?: 'number' | 'percentage' | 'duration' | 'currency';
}

// TopicPerformanceTable.tsx - Tabla de rendimiento por temas
interface TopicPerformanceTableProps {
  data: TopicPerformanceData[];
  sortBy: 'name' | 'score' | 'attempts' | 'difficulty';
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

// ExportModal.tsx - Modal para exportar reportes
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  reportType: 'template' | 'group' | 'user' | 'comprehensive';
}
```

**API Endpoints (.NET)**

```csharp
// === GENERAL ANALYTICS ===
// GET /api/analytics/overview?from=&to=&groupIds=&templateIds=
[HttpGet("overview")]
public async Task<ActionResult<ApiResponse<OverviewAnalyticsDto>>> GetOverviewAnalytics(
    [FromQuery] GetOverviewAnalyticsQuery query)

// GET /api/analytics/metrics?metric=&from=&to=&groupBy=&filters=
[HttpGet("metrics")]
public async Task<ActionResult<ApiResponse<List<MetricDataPointDto>>>> GetMetrics(
    [FromQuery] GetMetricsQuery query)

// === TEMPLATE ANALYTICS ===
// GET /api/analytics/templates/{templateId}?from=&to=&groupIds=
[HttpGet("templates/{templateId}")]
public async Task<ActionResult<ApiResponse<TemplateAnalyticsDto>>> GetTemplateAnalytics(
    int templateId, [FromQuery] GetTemplateAnalyticsQuery query)

// GET /api/analytics/templates/{templateId}/trends?period=&metric=
[HttpGet("templates/{templateId}/trends")]
public async Task<ActionResult<ApiResponse<List<TrendDataPointDto>>>> GetTemplateTrends(
    int templateId, [FromQuery] GetTrendsQuery query)

// GET /api/analytics/templates/{templateId}/topics-performance
[HttpGet("templates/{templateId}/topics-performance")]
public async Task<ActionResult<ApiResponse<List<TopicPerformanceDto>>>> GetTemplateTopicsPerformance(
    int templateId, [FromQuery] GetTopicsPerformanceQuery query)

// === GROUP ANALYTICS ===
// GET /api/analytics/groups/{groupId}?from=&to=&includeSubgroups=false
[HttpGet("groups/{groupId}")]
public async Task<ActionResult<ApiResponse<GroupAnalyticsDto>>> GetGroupAnalytics(
    int groupId, [FromQuery] GetGroupAnalyticsQuery query)

// GET /api/analytics/groups/{groupId}/members-performance
[HttpGet("groups/{groupId}/members-performance")]
public async Task<ActionResult<ApiResponse<List<UserPerformanceDto>>>> GetGroupMembersPerformance(
    int groupId, [FromQuery] GetMembersPerformanceQuery query)

// GET /api/analytics/groups/{groupId}/leaderboard?metric=&period=&limit=10
[HttpGet("groups/{groupId}/leaderboard")]
public async Task<ActionResult<ApiResponse<List<LeaderboardEntryDto>>>> GetGroupLeaderboard(
    int groupId, [FromQuery] GetLeaderboardQuery query)

// === USER ANALYTICS ===
// GET /api/analytics/users/{userId}?from=&to=&includeProgress=true
[HttpGet("users/{userId}")]
public async Task<ActionResult<ApiResponse<UserAnalyticsDto>>> GetUserAnalytics(
    string userId, [FromQuery] GetUserAnalyticsQuery query)

// GET /api/analytics/users/{userId}/progress?templateId=&topicId=
[HttpGet("users/{userId}/progress")]
public async Task<ActionResult<ApiResponse<UserProgressDto>>> GetUserProgress(
    string userId, [FromQuery] GetUserProgressQuery query)

// GET /api/analytics/users/{userId}/strengths-weaknesses
[HttpGet("users/{userId}/strengths-weaknesses")]
public async Task<ActionResult<ApiResponse<StrengthsWeaknessesDto>>> GetUserStrengthsWeaknesses(
    string userId, [FromQuery] GetStrengthsWeaknessesQuery query)

// === COMPARISON ANALYTICS ===
// POST /api/analytics/compare
[HttpPost("compare")]
public async Task<ActionResult<ApiResponse<ComparisonAnalyticsDto>>> CompareAnalytics(
    [FromBody] CompareAnalyticsRequest request)

// === EXPORT ENDPOINTS ===
// GET /api/analytics/export/csv?reportType=&filters=
[HttpGet("export/csv")]
public async Task<IActionResult> ExportToCsv([FromQuery] ExportQuery query)

// GET /api/analytics/export/pdf?reportType=&filters=
[HttpGet("export/pdf")]
public async Task<IActionResult> ExportToPdf([FromQuery] ExportQuery query)

// GET /api/analytics/export/excel?reportType=&filters=
[HttpGet("export/excel")]
public async Task<IActionResult> ExportToExcel([FromQuery] ExportQuery query)

// === REAL-TIME ANALYTICS ===
// GET /api/analytics/realtime/active-sessions
[HttpGet("realtime/active-sessions")]
public async Task<ActionResult<ApiResponse<List<ActiveSessionDto>>>> GetActiveSessions()

// GET /api/analytics/realtime/live-metrics
[HttpGet("realtime/live-metrics")]
public async Task<ActionResult<ApiResponse<LiveMetricsDto>>> GetLiveMetrics()
```

**Data Models**

```csharp
// AnalyticsAggregate base class
public abstract class AnalyticsAggregate
{
    public DateTime CalculatedAt { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public string AggregationType { get; set; } // "daily", "weekly", "monthly"
}

// TemplateAnalyticsAggregate - pre-calculated template metrics
public class TemplateAnalyticsAggregate : AnalyticsAggregate
{
    public int Id { get; set; }
    public int TemplateId { get; set; }
    public int? GroupId { get; set; } // null = all groups

    // Session metrics
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public int AbandonedSessions { get; set; }
    public int AutoSubmittedSessions { get; set; }
    public double CompletionRate => TotalSessions > 0 ? (double)CompletedSessions / TotalSessions : 0;

    // Performance metrics
    public double AverageScore { get; set; }
    public double MedianScore { get; set; }
    public double AverageDurationMinutes { get; set; }
    public double MedianDurationMinutes { get; set; }

    // Difficulty metrics
    public double PassRate { get; set; } // % above passing threshold
    public int UniqueTakers { get; set; }
    public int RepeatTakers { get; set; }

    // Integrity metrics
    public int SessionsWithViolations { get; set; }
    public int TotalIntegrityViolations { get; set; }
    public double IntegrityViolationRate => TotalSessions > 0 ? (double)SessionsWithViolations / TotalSessions : 0;

    // Topic breakdown (JSON)
    public string TopicPerformanceJson { get; set; } // Serialized topic scores

    // Navigation properties
    public SessionTemplate Template { get; set; }
    public Group? Group { get; set; }
}

// UserAnalyticsAggregate - pre-calculated user metrics
public class UserAnalyticsAggregate : AnalyticsAggregate
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int? TemplateId { get; set; } // null = all templates
    public int? TopicId { get; set; } // null = all topics

    // Session metrics
    public int TotalPracticeSessions { get; set; }
    public int TotalInterviewSessions { get; set; }
    public int CompletedSessions { get; set; }
    public double AverageSessionDuration { get; set; }

    // Performance metrics
    public double AverageScore { get; set; }
    public double BestScore { get; set; }
    public double ImprovementRate { get; set; } // Score improvement over time
    public int CurrentStreak { get; set; } // Consecutive days with activity

    // Progress metrics
    public int TopicsStarted { get; set; }
    public int TopicsCompleted { get; set; }
    public int CertificatesEarned { get; set; }
    public int CreditsConsumed { get; set; }

    // Engagement metrics
    public DateTime LastActivity { get; set; }
    public int ActiveDays { get; set; }
    public double AvgSessionsPerActiveDay { get; set; }

    // Navigation properties
    public User User { get; set; }
    public SessionTemplate? Template { get; set; }
    public Topic? Topic { get; set; }
}

// TopicAnalyticsAggregate - pre-calculated topic metrics
public class TopicAnalyticsAggregate : AnalyticsAggregate
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public QuestionLevel? Level { get; set; } // null = all levels

    // Question metrics
    public int TotalQuestions { get; set; }
    public int QuestionsAnswered { get; set; }
    public int CorrectAnswers { get; set; }
    public double SuccessRate => QuestionsAnswered > 0 ? (double)CorrectAnswers / QuestionsAnswered : 0;

    // Difficulty metrics
    public double AverageTimePerQuestion { get; set; }
    public int SkippedQuestions { get; set; }
    public double SkipRate => QuestionsAnswered > 0 ? (double)SkippedQuestions / QuestionsAnswered : 0;

    // User engagement
    public int UniqueUsers { get; set; }
    public int SessionsInvolving { get; set; }

    // Navigation properties
    public Topic Topic { get; set; }
}

// Real-time entities
public class ActiveSession
{
    public string SessionId { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public int TemplateId { get; set; }
    public string TemplateName { get; set; }
    public SessionType Type { get; set; }
    public DateTime StartedAt { get; set; }
    public int ElapsedMinutes { get; set; }
    public int TotalQuestions { get; set; }
    public int AnsweredQuestions { get; set; }
    public double CurrentScore { get; set; }
    public int IntegrityViolations { get; set; }
    public string Status { get; set; }
}

// Enums for analytics
public enum AnalyticsMetric
{
    Sessions = 1,
    CompletionRate = 2,
    AverageScore = 3,
    AverageDuration = 4,
    PassRate = 5,
    IntegrityViolations = 6,
    UserEngagement = 7,
    TopicMastery = 8
}

public enum TimePeriod
{
    Last7Days = 1,
    Last30Days = 2,
    Last90Days = 3,
    LastYear = 4,
    Custom = 5
}

public enum GroupByPeriod
{
    Day = 1,
    Week = 2,
    Month = 3,
    Quarter = 4,
    Year = 5
}
```

**DTOs y Requests**

```csharp
public class OverviewAnalyticsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsersToday { get; set; }
    public int ActiveUsersThisWeek { get; set; }
    public int ActiveUsersThisMonth { get; set; }

    public int TotalSessions { get; set; }
    public int SessionsToday { get; set; }
    public int CompletedSessions { get; set; }
    public double CompletionRate { get; set; }

    public double AverageScore { get; set; }
    public double AverageDuration { get; set; }
    public int CertificatesIssued { get; set; }
    public int IntegrityViolations { get; set; }

    public List<MetricDataPointDto> TrendData { get; set; } = new();
    public List<TopPerformingTemplateDto> TopTemplates { get; set; } = new();
    public List<TopPerformingUserDto> TopUsers { get; set; } = new();
}

public class TemplateAnalyticsDto
{
    public int TemplateId { get; set; }
    public string TemplateName { get; set; }
    public TemplateKind Kind { get; set; }

    // Session metrics
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public int AbandonedSessions { get; set; }
    public double CompletionRate { get; set; }
    public double AverageScore { get; set; }
    public double AverageDuration { get; set; }

    // User metrics
    public int UniqueTakers { get; set; }
    public int RepeatTakers { get; set; }
    public double PassRate { get; set; }

    // Integrity metrics
    public int SessionsWithViolations { get; set; }
    public int TotalIntegrityViolations { get; set; }
    public double IntegrityViolationRate { get; set; }

    // Performance by topic
    public List<TopicPerformanceDto> TopicPerformance { get; set; } = new();

    // Trends
    public List<TrendDataPointDto> ScoreTrends { get; set; } = new();
    public List<TrendDataPointDto> UsageTrends { get; set; } = new();

    // Comparison with previous period
    public PerformanceComparisonDto? Comparison { get; set; }
}

public class GroupAnalyticsDto
{
    public int GroupId { get; set; }
    public string GroupName { get; set; }
    public int MemberCount { get; set; }

    // Group performance
    public double GroupAverageScore { get; set; }
    public double GroupCompletionRate { get; set; }
    public int TotalGroupSessions { get; set; }
    public int ActiveMembers { get; set; }

    // Member performance distribution
    public List<UserPerformanceDto> MemberPerformance { get; set; } = new();
    public List<LeaderboardEntryDto> Leaderboard { get; set; } = new();

    // Template usage
    public List<TemplateUsageDto> TemplateUsage { get; set; } = new();

    // Progress tracking
    public List<ProgressDataPointDto> ProgressTrends { get; set; } = new();
}

public class UserAnalyticsDto
{
    public string UserId { get; set; }
    public string UserName { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime LastActivity { get; set; }

    // Overall performance
    public double OverallAverageScore { get; set; }
    public double BestScore { get; set; }
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public double CompletionRate { get; set; }

    // Progress metrics
    public int TopicsStarted { get; set; }
    public int TopicsCompleted { get; set; }
    public int CertificatesEarned { get; set; }
    public int CurrentStreak { get; set; }

    // Engagement
    public int ActiveDays { get; set; }
    public double AvgSessionsPerDay { get; set; }
    public TimeSpan TotalStudyTime { get; set; }

    // Strengths and weaknesses
    public List<TopicStrengthDto> Strengths { get; set; } = new();
    public List<TopicWeaknessDto> Weaknesses { get; set; } = new();

    // Performance trends
    public List<UserProgressDataPointDto> ProgressTrends { get; set; } = new();
    public List<ActivityDataPointDto> ActivityTrends { get; set; } = new();
}

public class TopicPerformanceDto
{
    public int TopicId { get; set; }
    public string TopicName { get; set; }
    public int QuestionsAnswered { get; set; }
    public int CorrectAnswers { get; set; }
    public double SuccessRate { get; set; }
    public double AverageTimePerQuestion { get; set; }
    public QuestionLevel MostDifficultLevel { get; set; }
    public double ImprovementRate { get; set; }
}

public class MetricDataPointDto
{
    public DateTime Date { get; set; }
    public string Label { get; set; }
    public double Value { get; set; }
    public string MetricType { get; set; }
    public string? ComparisonValue { get; set; }
}

public class ExportQuery
{
    public string ReportType { get; set; } // "overview", "template", "group", "user"
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public List<int>? TemplateIds { get; set; }
    public List<int>? GroupIds { get; set; }
    public List<string>? UserIds { get; set; }
    public string Format { get; set; } = "csv"; // "csv", "pdf", "excel"
    public bool IncludeCharts { get; set; } = false;
    public bool IncludeRawData { get; set; } = false;
}
```

**Business Logic - AnalyticsService**

```csharp
public class AnalyticsService : IAnalyticsService
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AnalyticsService> _logger;

    public async Task<OverviewAnalyticsDto> GetOverviewAnalyticsAsync(GetOverviewAnalyticsQuery query)
    {
        var cacheKey = $"overview_analytics_{query.From:yyyyMM}_{query.To:yyyyMM}_{string.Join(",", query.GroupIds ?? new List<int>())}";

        if (_cache.TryGetValue(cacheKey, out OverviewAnalyticsDto cachedResult))
            return cachedResult;

        var fromDate = query.From ?? DateTime.UtcNow.AddDays(-30);
        var toDate = query.To ?? DateTime.UtcNow;

        // Base queries with filters
        var sessionsQuery = _context.InterviewSessions
            .Where(s => s.StartedAt >= fromDate && s.StartedAt <= toDate);

        var practiceSessionsQuery = _context.PracticeSessions
            .Where(s => s.StartedAt >= fromDate && s.StartedAt <= toDate);

        if (query.GroupIds?.Any() == true)
        {
            var userIdsInGroups = await _context.UserGroups
                .Where(ug => query.GroupIds.Contains(ug.GroupId))
                .Select(ug => ug.UserId)
                .Distinct()
                .ToListAsync();

            sessionsQuery = sessionsQuery.Where(s => userIdsInGroups.Contains(s.UserId));
            practiceSessionsQuery = practiceSessionsQuery.Where(s => userIdsInGroups.Contains(s.UserId));
        }

        // Calculate metrics
        var totalSessions = await sessionsQuery.CountAsync() + await practiceSessionsQuery.CountAsync();
        var completedInterviewSessions = await sessionsQuery.Where(s => s.Status == SessionStatus.Completed).CountAsync();
        var completedPracticeSessions = await practiceSessionsQuery.Where(s => s.Status == SessionStatus.Completed).CountAsync();
        var completedSessions = completedInterviewSessions + completedPracticeSessions;

        var averageScore = 0.0;
        if (completedSessions > 0)
        {
            var interviewScores = await sessionsQuery
                .Where(s => s.Status == SessionStatus.Completed && s.TotalScore.HasValue)
                .Select(s => s.TotalScore.Value)
                .ToListAsync();

            var practiceScores = await practiceSessionsQuery
                .Where(s => s.Status == SessionStatus.Completed && s.TotalScore.HasValue)
                .Select(s => s.TotalScore.Value)
                .ToListAsync();

            var allScores = interviewScores.Concat(practiceScores);
            averageScore = allScores.Any() ? allScores.Average() : 0;
        }

        // Users metrics
        var totalUsers = await _context.Users.CountAsync();
        var activeUsersToday = await GetActiveUsersCountAsync(DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(1));
        var activeUsersThisWeek = await GetActiveUsersCountAsync(DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);
        var activeUsersThisMonth = await GetActiveUsersCountAsync(DateTime.UtcNow.AddDays(-30), DateTime.UtcNow);

        // Generate trend data
        var trendData = await GenerateTrendDataAsync(fromDate, toDate, "daily", query.GroupIds);

        var result = new OverviewAnalyticsDto
        {
            TotalUsers = totalUsers,
            ActiveUsersToday = activeUsersToday,
            ActiveUsersThisWeek = activeUsersThisWeek,
            ActiveUsersThisMonth = activeUsersThisMonth,
            TotalSessions = totalSessions,
            SessionsToday = await GetSessionsCountAsync(DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(1)),
            CompletedSessions = completedSessions,
            CompletionRate = totalSessions > 0 ? (double)completedSessions / totalSessions : 0,
            AverageScore = averageScore,
            AverageDuration = await CalculateAverageDurationAsync(fromDate, toDate),
            CertificatesIssued = await _context.InterviewCertificates
                .Where(c => c.IssuedAt >= fromDate && c.IssuedAt <= toDate)
                .CountAsync(),
            IntegrityViolations = await _context.IntegrityEvents
                .Where(e => e.Timestamp >= fromDate && e.Timestamp <= toDate)
                .CountAsync(),
            TrendData = trendData,
            TopTemplates = await GetTopPerformingTemplatesAsync(query.GroupIds, 5),
            TopUsers = await GetTopPerformingUsersAsync(query.GroupIds, 5)
        };

        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(15));
        return result;
    }

    public async Task<TemplateAnalyticsDto> GetTemplateAnalyticsAsync(int templateId, GetTemplateAnalyticsQuery query)
    {
        var template = await _context.SessionTemplates.FindAsync(templateId);
        if (template == null)
            throw new NotFoundException("Template not found");

        var fromDate = query.From ?? DateTime.UtcNow.AddDays(-30);
        var toDate = query.To ?? DateTime.UtcNow;

        // Get sessions for this template
        var sessionsQuery = _context.InterviewSessions
            .Where(s => s.TemplateId == templateId && s.StartedAt >= fromDate && s.StartedAt <= toDate);

        var practiceSessionsQuery = _context.PracticeSessions
            .Where(s => s.TemplateId == templateId && s.StartedAt >= fromDate && s.StartedAt <= toDate);

        if (query.GroupIds?.Any() == true)
        {
            var userIdsInGroups = await _context.UserGroups
                .Where(ug => query.GroupIds.Contains(ug.GroupId))
                .Select(ug => ug.UserId)
                .ToListAsync();

            sessionsQuery = sessionsQuery.Where(s => userIdsInGroups.Contains(s.UserId));
            practiceSessionsQuery = practiceSessionsQuery.Where(s => userIdsInGroups.Contains(s.UserId));
        }

        // Calculate metrics
        var interviewSessions = await sessionsQuery.ToListAsync();
        var practiceSessions = await practiceSessionsQuery.ToListAsync();
        var allSessions = interviewSessions.Count + practiceSessions.Count;

        var completedSessions = interviewSessions.Count(s => s.Status == SessionStatus.Completed) +
                               practiceSessions.Count(s => s.Status == SessionStatus.Completed);

        var abandonedSessions = interviewSessions.Count(s => s.Status == SessionStatus.Abandoned) +
                               practiceSessions.Count(s => s.Status == SessionStatus.Abandoned);

        // Calculate scores
        var scores = new List<double>();
        scores.AddRange(interviewSessions.Where(s => s.TotalScore.HasValue).Select(s => (double)s.TotalScore.Value));
        scores.AddRange(practiceSessions.Where(s => s.TotalScore.HasValue).Select(s => (double)s.TotalScore.Value));

        var averageScore = scores.Any() ? scores.Average() : 0;

        // Calculate durations
        var durations = new List<double>();
        durations.AddRange(interviewSessions.Where(s => s.FinishedAt.HasValue)
            .Select(s => (s.FinishedAt.Value - s.StartedAt).TotalMinutes));
        durations.AddRange(practiceSessions.Where(s => s.FinishedAt.HasValue)
            .Select(s => (s.FinishedAt.Value - s.StartedAt).TotalMinutes));

        var averageDuration = durations.Any() ? durations.Average() : 0;

        // Users metrics
        var allUserIds = interviewSessions.Select(s => s.UserId)
            .Concat(practiceSessions.Select(s => s.UserId))
            .ToList();

        var uniqueTakers = allUserIds.Distinct().Count();
        var repeatTakers = allUserIds.GroupBy(id => id).Count(g => g.Count() > 1);

        // Integrity violations
        var sessionIds = interviewSessions.Select(s => s.Id.ToString()).ToList();
        var violationsCount = await _context.IntegrityEvents
            .Where(e => sessionIds.Contains(e.SessionId))
            .CountAsync();

        var sessionsWithViolations = await _context.IntegrityEvents
            .Where(e => sessionIds.Contains(e.SessionId))
            .Select(e => e.SessionId)
            .Distinct()
            .CountAsync();

        // Topic performance
        var topicPerformance = await CalculateTopicPerformanceAsync(templateId, fromDate, toDate);

        return new TemplateAnalyticsDto
        {
            TemplateId = templateId,
            TemplateName = template.Name,
            Kind = template.Kind,
            TotalSessions = allSessions,
            CompletedSessions = completedSessions,
            AbandonedSessions = abandonedSessions,
            CompletionRate = allSessions > 0 ? (double)completedSessions / allSessions : 0,
            AverageScore = averageScore,
            AverageDuration = averageDuration,
            UniqueTakers = uniqueTakers,
            RepeatTakers = repeatTakers,
            PassRate = CalculatePassRate(scores, template.PassingScore ?? 70),
            SessionsWithViolations = sessionsWithViolations,
            TotalIntegrityViolations = violationsCount,
            IntegrityViolationRate = interviewSessions.Count > 0 ? (double)sessionsWithViolations / interviewSessions.Count : 0,
            TopicPerformance = topicPerformance,
            ScoreTrends = await GenerateScoreTrendsAsync(templateId, fromDate, toDate),
            UsageTrends = await GenerateUsageTrendsAsync(templateId, fromDate, toDate)
        };
    }

    private async Task<int> GetActiveUsersCountAsync(DateTime from, DateTime to)
    {
        var interviewUsers = _context.InterviewSessions
            .Where(s => s.StartedAt >= from && s.StartedAt < to)
            .Select(s => s.UserId);

        var practiceUsers = _context.PracticeSessions
            .Where(s => s.StartedAt >= from && s.StartedAt < to)
            .Select(s => s.UserId);

        return await interviewUsers.Union(practiceUsers).Distinct().CountAsync();
    }

    private async Task<double> CalculateAverageDurationAsync(DateTime from, DateTime to)
    {
        var interviewDurations = await _context.InterviewSessions
            .Where(s => s.StartedAt >= from && s.StartedAt <= to && s.FinishedAt.HasValue)
            .Select(s => (s.FinishedAt.Value - s.StartedAt).TotalMinutes)
            .ToListAsync();

        var practiceDurations = await _context.PracticeSessions
            .Where(s => s.StartedAt >= from && s.StartedAt <= to && s.FinishedAt.HasValue)
            .Select(s => (s.FinishedAt.Value - s.StartedAt).TotalMinutes)
            .ToListAsync();

        var allDurations = interviewDurations.Concat(practiceDurations);
        return allDurations.Any() ? allDurations.Average() : 0;
    }

    private double CalculatePassRate(List<double> scores, double passingScore)
    {
        if (!scores.Any()) return 0;
        var passedCount = scores.Count(s => s >= passingScore);
        return (double)passedCount / scores.Count;
    }
}
```

**Frontend Components Implementation**

```typescript
// components/admin/AnalyticsDashboard.tsx
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ timeRange, filters, onFiltersChange }) => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview', timeRange, filters],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<OverviewAnalytics>>('/api/analytics/overview', {
        params: {
          from: timeRange.from?.toISOString(),
          to: timeRange.to?.toISOString(),
          groupIds: filters.groupIds?.join(','),
          templateIds: filters.templateIds?.join(',')
        }
      });
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Usuarios Activos Hoy"
          value={overview?.data.activeUsersToday || 0}
          change={calculateChange(overview?.data.activeUsersToday, overview?.data.activeUsersYesterday)}
          changeType="positive"
          format="number"
        />
        <MetricsCard
          title="Sesiones Completadas"
          value={overview?.data.completedSessions || 0}
          change={overview?.data.completionRate}
          changeType="neutral"
          format="percentage"
        />
        <MetricsCard
          title="Score Promedio"
          value={overview?.data.averageScore || 0}
          change={calculateScoreChange(overview?.data.averageScore, overview?.data.previousPeriodScore)}
          changeType="positive"
          format="number"
        />
        <MetricsCard
          title="Certificados Emitidos"
          value={overview?.data.certificatesIssued || 0}
          change={calculateChange(overview?.data.certificatesIssued, overview?.data.previousCertificates)}
          changeType="positive"
          format="number"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Sesiones</h3>
          <PerformanceChart
            data={overview?.data.trendData || []}
            type="line"
            metric="sessions"
            groupBy="day"
          />
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Scores</h3>
          <PerformanceChart
            data={overview?.data.scoreDistribution || []}
            type="bar"
            metric="score"
            groupBy="range"
          />
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates Más Usados</h3>
          <div className="space-y-3">
            {overview?.data.topTemplates.map((template, index) => (
              <div key={template.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                  <span className="text-sm text-gray-700">{template.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{template.sessionsCount}</span>
                  <span className="text-xs text-gray-500 ml-1">sesiones</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mejores Estudiantes</h3>
          <div className="space-y-3">
            {overview?.data.topUsers.map((user, index) => (
              <div key={user.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">#{index + 1}</span>
                  <span className="text-sm text-gray-700">{user.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{user.averageScore.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-1">avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad en Tiempo Real</h3>
          <span className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            En vivo
          </span>
        </div>
        <ActiveSessionsTable />
      </div>
    </div>
  );
};

// components/admin/ExportModal.tsx
export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data, reportType }) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [includeCharts, setIncludeCharts] = useState(false);
  const [includeRawData, setIncludeRawData] = useState(false);

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.get(`/api/analytics/export/${exportFormat}`, {
        params: {
          reportType,
          includeCharts,
          includeRawData,
          ...data.filters
        },
        responseType: 'blob'
      });
      return response.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${reportType}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte exportado exitosamente');
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Exportar Reporte</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="csv">CSV (Excel Compatible)</option>
              <option value="pdf">PDF Report</option>
              <option value="excel">Excel Workbook</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Incluir gráficos (solo PDF/Excel)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">Incluir datos en bruto</span>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              El reporte incluirá todos los datos visibles actualmente con los filtros aplicados.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

**AC (Criterios de Aceptación)**

1. **Métricas mínimas**: Dashboard muestra finalización, % acierto por tema, tiempo medio, e incidentes de integridad para todos los templates y usuarios.

2. **Filtros por grupo**: Todas las vistas analíticas permiten filtrar por grupo específico o múltiples grupos, mostrando solo datos de miembros.

3. **Comparación temporal**: Capacidad de comparar métricas entre períodos (mes actual vs anterior, trimestre vs trimestre).

4. **Exportación completa**: Reportes exportables en CSV, PDF y Excel con gráficos y datos en bruto opcionales.

5. **Analytics en tiempo real**: Vista de sesiones activas y métricas en vivo con actualización automática.

6. **Análisis de tendencias**: Gráficos de evolución temporal para scores, completación y engagement por usuario/grupo/template.

7. **Identificación de fortalezas/debilidades**: Sistema automático que identifica temas donde usuarios/grupos sobresalen o necesitan mejora.

8. **Performance cacheada**: Métricas complejas se pre-calculan y cachean para respuesta rápida (<2 segundos para dashboards).

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