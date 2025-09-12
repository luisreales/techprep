# TechPrep – Role Separation (Frontend & Backend)

**Goal:**  
Implement **role-based UX** and **route guards** for **Admin** and **Student**:

- **Frontend (React + TS + Vite + Zustand + React Router)**
  - Separate **NavBar menus** by role
  - Add **AuthGuard** and **RoleGuard('Admin')**
  - Organize routes under clear **paths**:
    - **Student** app: `/dashboard`, `/practice`, `/sessions`, `/challenges`, `/resources`, `/profile`
    - **Admin** app: `/admin`, `/admin/questions`, `/admin/import`, `/admin/challenges`, `/admin/users`, `/admin/resources`, `/admin/settings`
- **Backend (.NET 8 + ASP.NET Core Identity + JWT)**
  - Ensure **roles** (`Admin`, `Student`) seeded
  - Issue JWT with **role claim**
  - Protect **Admin** endpoints with `[Authorize(Roles = "Admin")]`
  - Keep Student endpoints `[Authorize]` (any authenticated user)

---

## 0) Assumptions

- You already have ASP.NET Core Identity with `User : IdentityUser<Guid>`.
- Login endpoint returns:
  ```json
  { "token": "jwt", "email": "...", "firstName": "...", "lastName": "..." }
Register endpoint creates users with role Student by default (seeder ensures roles exist).

1) Backend – Configure AuthZ & Role Claims
1.1 Add roles and JWT validation (Program.cs)
csharp
Copiar código
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.IdentityModel.Tokens;
// using System.Security.Claims;
// using System.Text;

builder.Services
  .AddIdentity<User, IdentityRole<Guid>>(o =>
  {
      o.Password.RequireDigit = true;
      o.Password.RequireLowercase = true;
      o.Password.RequireUppercase = true;
      o.Password.RequireNonAlphanumeric = false;
      o.Password.RequiredLength = 6;
      o.User.RequireUniqueEmail = true;
  })
  .AddEntityFrameworkStores<TechPrepDbContext>()
  .AddDefaultTokenProviders();

var jwt = builder.Configuration.GetSection("JwtSettings");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(o =>
  {
      o.TokenValidationParameters = new TokenValidationParameters
      {
          ValidateIssuer = !string.IsNullOrWhiteSpace(jwt["Issuer"]),
          ValidateAudience = !string.IsNullOrWhiteSpace(jwt["Audience"]),
          ValidateLifetime = true,
          ValidateIssuerSigningKey = true,
          ValidIssuer = jwt["Issuer"],
          ValidAudience = jwt["Audience"],
          IssuerSigningKey = signingKey,
          ClockSkew = TimeSpan.Zero
      };
  });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});
1.2 Ensure role claim is inside JWT
In your token generator, add ClaimTypes.Role (or "role") with each user role.

csharp
Copiar código
// using System.IdentityModel.Tokens.Jwt;
// using System.Security.Claims;

private string GenerateJwtToken(User user, IList<string> roles)
{
    var jwt = _config.GetSection("JwtSettings");
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new(JwtRegisteredClaimNames.Email, user.Email!),
        new("firstName", user.FirstName ?? string.Empty),
        new("lastName", user.LastName ?? string.Empty)
    };

    foreach (var r in roles)
        claims.Add(new Claim(ClaimTypes.Role, r)); // => "role" claim

    var token = new JwtSecurityToken(
        issuer: jwt["Issuer"],
        audience: jwt["Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiryInMinutes"] ?? "60")),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
Use it in the login action:

csharp
Copiar código
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user is null) return Unauthorized(new { message = "Invalid credentials." });

    var pwd = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
    if (!pwd.Succeeded) return Unauthorized(new { message = "Invalid credentials." });

    var roles = await _userManager.GetRolesAsync(user);
    var token = GenerateJwtToken(user, roles);

    return Ok(new {
        token,
        email = user.Email,
        firstName = user.FirstName,
        lastName = user.LastName
    });
}
1.3 Seed roles + admin (on startup)
Create Infrastructure/Seed/AppSeeder.cs (if not exists) and call it in Program.cs. Ensure roles Admin, Student, and admin user admin@techprep.com (Nojoda123*).

csharp
Copiar código
// after app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    await AppSeeder.SeedAsync(scope.ServiceProvider);
}
1.4 Protect Admin routes
Admin-only controllers under api/admin/*:

csharp
Copiar código
[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")] // or [Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase { ... }

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class ImportController : ControllerBase { ... }

// etc: QuestionsController, ChallengesController, ResourcesController, SettingsController
Student endpoints remain under api/* with [Authorize] (no role required).

2) Frontend – Role-aware Nav & Guards
2.1 Decode role(s) from JWT on login
After login, store token and decode roles using a tiny helper (no external lib required).

ts
Copiar código
// src/utils/jwt.ts
export type JwtPayload = { email?: string; firstName?: string; lastName?: string; role?: string | string[] };

export function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
In the auth store, when login succeeds:

ts
Copiar código
// after receiving { token, email, firstName, lastName }
const payload = decodeJwt(token);
const roles = Array.isArray(payload?.role) ? payload?.role : [payload?.role].filter(Boolean);
const userRole = roles?.includes('Admin') ? 'Admin' : 'Student';

set({
  user: { email, firstName, lastName, role: userRole },
  accessToken: token,
  isAuthenticated: true,
  ...
});
Ensure persisted auth re-applies Authorization header on rehydrate.

2.2 Guards
tsx
Copiar código
// src/utils/guards.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const RoleGuard: React.FC<React.PropsWithChildren<{ role: 'Admin' | 'Student' }>> = ({ role, children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role === 'Admin' && user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
2.3 NavBar items by role
tsx
Copiar código
// src/components/layout/NavBar.tsx
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const NavBar = () => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;

  const isAdmin = user?.role === 'Admin';

  return (
    <nav className="...">
      <div className="flex gap-4">
        {/* Student menu */}
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/practice">Práctica</Link>
        <Link to="/sessions">Sesiones</Link>
        <Link to="/challenges">Challenges</Link>
        <Link to="/resources">Recursos</Link>
        <Link to="/profile">Perfil</Link>

        {/* Admin menu */}
        {isAdmin && (
          <>
            <Link to="/admin">Admin</Link>
            <Link to="/admin/questions">Preguntas</Link>
            <Link to="/admin/import">Importar Excel</Link>
            <Link to="/admin/challenges">Challenges</Link>
            <Link to="/admin/users">Usuarios</Link>
            <Link to="/admin/resources">Recursos</Link>
            <Link to="/admin/settings">Configuración</Link>
          </>
        )}
      </div>
    </nav>
  );
};
2.4 Routes (split per role)
tsx
Copiar código
// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { AuthGuard, RoleGuard } from '@/utils/guards';

export const router = createBrowserRouter([
  // Public
  { path: '/login', element: <LoginPage/> },
  { path: '/register', element: <RegisterPage/> },

  // Student space
  {
    path: '/',
    element: <AuthGuard><AppLayout/></AuthGuard>,
    children: [
      { path: 'dashboard', element: <DashboardPage/> },
      { path: 'practice', element: <PracticePage/> },
      { path: 'sessions', element: <SessionsListPage/> },
      { path: 'sessions/:id', element: <SessionSummaryPage/> },
      { path: 'challenges', element: <ChallengesPage/> },
      { path: 'resources', element: <ResourcesPage/> },
      { path: 'profile', element: <ProfilePage/> },
      { index: true, element: <Navigate to="/dashboard" replace/> }
    ]
  },

  // Admin space
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <RoleGuard role="Admin"><AdminLayout/></RoleGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <AdminHome/> },
      { path: 'questions', element: <AdminQuestionsPage/> },
      { path: 'import', element: <AdminImportPage/> },
      { path: 'challenges', element: <AdminChallengesPage/> },
      { path: 'users', element: <AdminUsersPage/> },
      { path: 'resources', element: <AdminResourcesPage/> },
      { path: 'settings', element: <AdminSettingsPage/> }
    ]
  }
]);
2.5 API surface (frontend)
Student uses /api/...

Admin uses /api/admin/...

Provide two clients or one client with paths:

ts
Copiar código
// src/services/api.ts
export const api = {
  // student endpoints
  getTopics: () => http.get('/topics'),
  getQuestions: (p) => http.get('/questions', { params: p }),
  // ...

  // admin endpoints
  admin: {
    importExcel: (form: FormData) => http.post('/admin/import/excel', form, { headers: {'Content-Type': 'multipart/form-data'} }),
    listUsers: () => http.get('/admin/users'),
    blockUser: (id: string) => http.post(`/admin/users/${id}/block`, {}),
    // ...
  }
};
3) Backend – Route layout by area
Student endpoints:

GET /api/topics, GET /api/questions, POST /api/sessions, ...

[Authorize]

Admin endpoints (prefix /api/admin/):

POST /api/admin/import/excel

GET/POST/PUT/DELETE /api/admin/questions

GET/PUT /api/admin/users

[Authorize(Roles = "Admin")]

Controllers:

csharp
Copiar código
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuestionsController : ControllerBase { ... }

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class QuestionsController : ControllerBase { ... } // Admin CRUD
(Use distinct class names or different namespaces; student controller may be PracticeQuestionsController vs admin AdminQuestionsController.)

4) Acceptance Checklist
 After login, JWT payload contains role claim; frontend derives user.role.

 Student menu shows only student items; Admin sees Admin section too.

 Visiting /admin/* as Student redirects to /dashboard.

 Backend returns 401 for unauthenticated, 403 if not in role for /api/admin/*.

 Register endpoint always assigns Student.

 Seeder ensures roles Admin, Student and creates admin@techprep.com.

5) Nice-to-haves
Add a small useHasRole('Admin') hook to simplify checks.

Add Swagger security scheme and tag admin endpoints as “Admin”.

Log the decoded roles in dev to verify JWT contents.

Add e2e tests: login as Student → /admin redirects; login as Admin → access granted.