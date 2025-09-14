Backend (.NET 8 Web API + Identity + SQLite)
B1. Endpoints Admin (/api/admin/users/*) con guard

 Crear controller AdminUsersController con [Authorize(Roles="Admin")].

 GET /api/admin/users

Query: q (email/nombre), role, status (Active|Blocked), page, pageSize, sort.

Devuelve: lista paginada (Id, Email, Nombre, Roles, Estado, FechaRegistro).

 GET /api/admin/users/{id}

Devuelve: perfil con claims/roles/estado.

 PUT /api/admin/users/{id}/roles

Body: { roles: string[] } (p.ej. ["Admin","Student"]).

Reemplaza roles del usuario (valida contra catálogo de roles).

 PUT /api/admin/users/{id}/block

Body: { blocked: boolean, reason?: string }.

Implementar vía LockoutEnabled + LockoutEnd o flag IsActive.

 POST /api/admin/users/invite (opcional)

Body: { email, firstName?, lastName?, roles: string[] } → crea usuario temporal y envía invitación (MVP: sin email real).

 POST /api/admin/users/{id}/reset-password

Genera token de reset y lo retorna (MVP) { resetToken }.

B2. Servicios y Reglas

 UserAdminService:

SearchAsync, GetAsync, SetRolesAsync, SetBlockedAsync, InviteAsync, GenerateResetTokenAsync.

 Validaciones:

Roles válidos: "Admin"|"Student".

No permitir que un Admin se bloquee a sí mismo ni se quite su único rol Admin si es el último admin del sistema.

 Mapeos DTOs:

ListItemDto, DetailDto, UpdateRolesDto, BlockDto, InviteDto, ResetPasswordTokenDto.

 Paginación/orden:

Por defecto pageSize=20, orden por CreatedAt desc.

 Auditoría mínima:

Log en Serilog: UserIdAdmin, acción (assign_roles/block/unblock/invite/reset_token), TargetUserId.

 Swagger:

Documentar esquema de respuestas y ejemplos.

B3. Tests

 Unit tests: SetRoles, Block/Unblock, Search filters.

 Integración: endpoints 200/400/403, guard de rol Admin.

Frontend (React + TS + Vite + Zustand + TanStack Query)
F1. Rutas y Guards

 Ruta protegida por Admin: /admin/users.

 RoleGuard('Admin') aplicado.

F2. Página Users (Admin)

 Listado con filtros y acciones

Filtros: Búsqueda (email/nombre), Rol (Admin/Student), Estado (Activo/Bloqueado).

Tabla: Email, Nombre, Roles (chips), Estado, Fecha, Acciones.

Paginación, orden por fecha/email.

 Acciones en fila

Asignar roles (modal):

Toggle Admin / Student (multi-select).

Confirmar → PUT /roles.

Bloquear/Desbloquear (confirm):

PUT /block { blocked: true|false, reason? }.

Reset password (confirm):

POST /reset-password → mostrar token (copiar) en modal (MVP).

 Invitar usuario (opcional MVP)

Modal: Email, Nombre(s), Roles → POST /invite.

 Estados UI:

Loading skeletons, vacíos (“No hay usuarios”), toasts éxito/error.

F3. Servicios/Queries

 adminUsersApi:

list(params), get(id), setRoles(id, roles), setBlocked(id, blocked, reason?), resetPassword(id), invite(dto).

 Hooks Query:

useUsersList(params), useUserDetail(id), useSetRoles(), useSetBlocked(), useResetPassword(), useInviteUser().

Invalidate keys en mutaciones.

F4. Accesibilidad/UX

 Confirm dialogs con copy claro.

 Deshabilitar acciones mientras se muta.

 Indicar visualmente estado Bloqueado (chip rojo) / Activo (chip verde).

 Prevenir que un admin elimine su último rol Admin (mensaje claro).

Contratos (resumen)
List

GET /api/admin/users?q&role&status&page&pageSize&sort

{
  "items": [
    { "id":"GUID", "email":"a@x.com", "firstName":"A", "lastName":"X", "roles":["Student"], "status":"Active", "createdAt":"2025-01-01T10:00:00Z" }
  ],
  "page":1, "pageSize":20, "total":123
}

Detail

GET /api/admin/users/{id}

{ "id":"GUID","email":"...","firstName":"...","lastName":"...","roles":["Admin"],"status":"Blocked","createdAt":"..." }

Set roles

PUT /api/admin/users/{id}/roles

{ "roles": ["Admin","Student"] }

Block/Unblock

PUT /api/admin/users/{id}/block

{ "blocked": true, "reason": "violación de términos" }

Reset password (MVP)

POST /api/admin/users/{id}/reset-password

{ "resetToken": "eyJhbGciOi..." }

Invite (opcional)

POST /api/admin/users/invite

{ "email":"new@x.com","firstName":"New","lastName":"User","roles":["Student"] }

Criterios de aceptación

 Solo Admin accede a /admin/users y a los endpoints /api/admin/users/*.

 Listado con filtros, paginación y acciones por usuario.

 Asignación de roles funcional con validación de “último admin”.

 Bloqueo/desbloqueo actualiza estado y evita login si bloqueado.

 Reset password genera token visible (MVP).

 Logs de auditoría para todas las acciones administrativas.

Si quieres, te genero los stubs de componentes de React (tabla, modales) y los métodos del controller con DTOs para pegar y compilar.

Dijiste:
recordar que se usan las tablas de AspNetUser y AspNetRoles y sus tablas asociadas
ChatGPT dijo:

¡Anotado! Para RF-B09.2: Gestión de usuarios y roles debemos trabajar exclusivamente con las tablas de ASP.NET Identity:

AspNetUsers

AspNetRoles

AspNetUserRoles (join)

AspNetUserClaims, AspNetUserLogins, AspNetUserTokens, AspNetRoleClaims

Backend – usa siempre Identity APIs (no SQL directo)

Lectura/alta/baja/cambio de roles: UserManager<User> y RoleManager<IdentityRole<Guid>>.

Bloqueo/desbloqueo: LockoutEnabled + LockoutEnd en AspNetUsers.

Nunca insertes contraseñas ni relaciones rol-usuario a mano.

Ejemplos rápidos (controlador Admin)
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly UserManager<User> _users;
    private readonly RoleManager<IdentityRole<Guid>> _roles;

    public AdminUsersController(UserManager<User> users, RoleManager<IdentityRole<Guid>> roles)
    { _users = users; _roles = roles; }

    // List users + roles (paginable)
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _users.Users.OrderByDescending(u => u.CreatedAt); // si tienes CreatedAt; si no, por Email
        var items = await query.Skip((page-1)*pageSize).Take(pageSize).ToListAsync();

        var result = new List<object>();
        foreach (var u in items)
        {
            var roles = await _users.GetRolesAsync(u);
            var status = (u.LockoutEnabled && u.LockoutEnd.HasValue && u.LockoutEnd > DateTimeOffset.UtcNow)
                ? "Blocked" : "Active";
            result.Add(new { u.Id, u.Email, u.FirstName, u.LastName, Roles = roles, Status = status });
        }
        var total = await query.CountAsync();
        return Ok(new { items = result, page, pageSize, total });
    }

    // Set roles (reemplaza)
    [HttpPut("{id:guid}/roles")]
    public async Task<IActionResult> SetRoles(Guid id, [FromBody] SetRolesDto body)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        var current = await _users.GetRolesAsync(user);
        var toRemove = current.Except(body.Roles);
        var toAdd    = body.Roles.Except(current);

        foreach (var r in body.Roles)
            if (!await _roles.RoleExistsAsync(r)) return BadRequest(new { message = $"Role '{r}' not found" });

        // Evitar quitar el último Admin del sistema
        if (current.Contains("Admin") && !body.Roles.Contains("Admin"))
        {
            var anyOtherAdmin = await _users.GetUsersInRoleAsync("Admin");
            if (anyOtherAdmin.Count <= 1) return BadRequest(new { message = "Cannot remove the last Admin" });
        }

        await _users.RemoveFromRolesAsync(user, toRemove);
        await _users.AddToRolesAsync(user, toAdd);
        return NoContent();
    }

    // Block / Unblock
    [HttpPut("{id:guid}/block")]
    public async Task<IActionResult> Block(Guid id, [FromBody] BlockUserDto body)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        if (body.Blocked)
        {
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
        }
        else
        {
            user.LockoutEnd = DateTimeOffset.UtcNow.AddSeconds(-1);
        }
        await _users.UpdateAsync(user);
        return NoContent();
    }
}

public record SetRolesDto(List<string> Roles);
public record BlockUserDto(bool Blocked, string? Reason);

Frontend (React)

Página /admin/users (solo Admin) con:

Listado (email, nombre, roles, estado) → GET /api/admin/users.

Asignar roles (modal) → PUT /api/admin/users/{id}/roles con ["Admin","Student"].

Bloquear/Desbloquear → PUT /api/admin/users/{id}/block { blocked: true|false }.

Usa Zustand para auth (roles desde JWT) y TanStack Query para listar/mutar.

Si necesitas ver datos en DBeaver (solo lectura)

Usuarios con sus roles:

SELECT u.Id, u.Email, r.Name AS Role
FROM AspNetUsers u
LEFT JOIN AspNetUserRoles ur ON ur.UserId = u.Id
LEFT JOIN AspNetRoles r ON r.Id = ur.RoleId
ORDER BY u.Email;


Bloqueados:

SELECT Id, Email, LockoutEnabled, LockoutEnd
FROM AspNetUsers
WHERE LockoutEnabled = 1 AND LockoutEnd > CURRENT_TIMESTAMP;

Resumen

✅ Nos apoyamos en AspNetUsers/AspNetRoles y UserManager/RoleManager.

✅ Nada de inserts manuales de contraseñas ni de relaciones.

✅ Bloqueo con Lockout; roles vía Get/Add/RemoveFromRolesAsync.

✅ Frontend: tabla + modales y llamadas a endpoints admin.