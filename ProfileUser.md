TechPrep — Sticky TopBar Profile + User Profile Module (RF-B09.6)

Stack assumptions: React (Vite + TS) · Bootstrap 5 (native) for the nav bar (may coexist with Tailwind) · .NET 8 Web API + Identity (SQLite)

0) Scope

Add a sticky top navigation bar (position: sticky; top: 0; z-index: 1030) with a circular profile avatar on the right.

Clicking the avatar toggles a profile dropdown menu (pure JS, Bootstrap-compatible).

New Profile page for users to manage:

First name, Last name

Avatar (upload)

Language (en, es) — persisted

Theme (Light, Dark, Blue) — persisted (Blue can alias Light with brand accent for now)

Keep everything additive. No breaking changes.

1) Backend (.NET 8) — API & Storage
1.1 DTOs
public record UserProfileDto(
  Guid Id, string Email, string FirstName, string LastName,
  string? AvatarUrl, string Language, string Theme
);

public record UpdateProfileDto(
  string FirstName, string LastName, string Language, string Theme
);

1.2 Extend User (Identity) if missing

Add nullable fields (migration-safe):

// In User entity:
public string? FirstName { get; set; }
public string? LastName  { get; set; }
public string Language   { get; set; } = "en";     // "en" | "es"
public string Theme      { get; set; } = "light";  // "light" | "dark" | "blue"
public string? AvatarUrl { get; set; }             // public path or CDN


Create EF migration (e.g., UserProfile_Fields) and update DB.

1.3 Controller (authenticated)

[Authorize] [Route("api/profile")]

GET /api/profile/me → UserProfileDto (read current user by UserManager.GetUserAsync(User)).

PUT /api/profile/me (body: UpdateProfileDto) → updates FirstName, LastName, Language (en|es), Theme (light|dark|blue). Validate allowed values.

POST /api/profile/avatar (multipart/form-data: file)

Validate: image only (png|jpg|jpeg|webp), max 2MB.

Store in wwwroot/uploads/avatars/{userId}.{ext} (or a GUID filename).

Update AvatarUrl with public path (e.g., /uploads/avatars/...).

Return updated UserProfileDto.

Security notes

Only the owner can update their profile.

Sanitize filenames; never trust original filename.

Optionally generate multiple sizes (MVP: one size is fine).

Serilog audit

Log profile_update and avatar_upload with user id/email.

2) Frontend (React + TS) — TopBar + Profile
2.1 TopBar (sticky) with avatar toggle

New component: src/components/layout/TopBar.tsx

Bootstrap 5 nav markup (no jQuery). Keep sticky with position: sticky.

Right-aligned avatar button (40×40 px, border-radius: 50%, object-fit: cover).

Dropdown behavior (vanilla TS):

Click avatar → toggle menu (add/remove show class and set aria-expanded).

Click outside or Esc → close menu.

Trap focus inside menu when open (basic loop).

Menu items:

“Profile” → /profile

Divider

“Settings” (if Admin) → /admin/settings

Divider

“Sign out” → calls store logout

Load avatar URL from auth store (fallback: initials circle SVG).

Keep nav responsive; on mobile, collapse links into hamburger if already supported.

Accessibility

role="button", aria-haspopup="menu", aria-expanded

Menu role="menu"; items role="menuitem"

Close on Esc

2.2 Route & Page

Add route /profile (authenticated; any role).

Page: src/pages/profile/ProfilePage.tsx

Form (React Hook Form + Zod or basic HTML validation):

First name, Last name (text)

Language (select: English/Spanish → en|es)

Theme (radio: Light/Dark/Blue)

Avatar uploader:

Current avatar preview (circle)

“Change” → file input, POST to /api/profile/avatar (show progress).

Actions:

[Save changes] → PUT /api/profile/me

Toast/success and optimistic update in store

Optional: show read-only Email

State integration

Extend auth store user type to include firstName, lastName, avatarUrl, language, theme.

On login/refresh → fetch /api/profile/me to hydrate (or embed minimal in token).

When saving → update store and re-apply theme/i18n (see below).

2.3 Theme & Language application

Theme: add data-theme="light|dark|blue" on <html> or <body>.

Provide minimal CSS tokens (Bootstrap variables override or utility classes):

light: default

dark: toggle data-bs-theme="dark" (Bootstrap 5.3+ native support)

blue: keep light palette but set accent brand color (e.g., --bs-primary: #2563eb)

Language: if using i18n (e.g., i18next), call i18n.changeLanguage(language) after save; otherwise, store selection for future use.

3) Frontend — API clients & hooks
3.1 API client

src/services/profileApi.ts

import { http } from '@/utils/axios';
import type { AxiosResponse } from 'axios';

export type UserProfile = {
  id: string; email: string; firstName: string; lastName: string;
  avatarUrl?: string | null; language: 'en'|'es'; theme: 'light'|'dark'|'blue';
};

export const profileApi = {
  me: () => http.get<UserProfile>('/profile/me').then(r => r.data),
  update: (dto: { firstName: string; lastName: string; language: 'en'|'es'; theme: 'light'|'dark'|'blue'; }) =>
    http.put<UserProfile>('/profile/me', dto).then(r => r.data),
  uploadAvatar: (file: File) => {
    const form = new FormData(); form.append('file', file);
    return http.post<UserProfile>('/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r: AxiosResponse<UserProfile>) => r.data);
  },
};

3.2 Hooks

src/hooks/useProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, UserProfile } from '@/services/profileApi';

export const useProfile = () =>
  useQuery<UserProfile>({ queryKey: ['me'], queryFn: profileApi.me });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: (data) => {
      qc.setQueryData(['me'], data);
      // also update auth store if needed
    },
  });
};

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: (data) => qc.setQueryData(['me'], data),
  });
};

4) Acceptance Criteria

TopBar

 Sticks to top; shows circular avatar aligned right.

 Clicking avatar toggles a dropdown; clicking outside or pressing Esc closes it.

 Menu has “Profile”, “Settings” (admins only), “Sign out”.

 Accessible roles/aria attributes; keyboard operable.

Profile Page

 Shows current first/last name, language, theme, and avatar.

 User can update name, language, theme; changes persist and reflect immediately.

 Avatar upload accepts only images (<= 2MB), updates preview and persists path.

 Theme applies at app level; language selection persists.

 Non-admins can access /profile but not admin-only pages.

Backend

 /api/profile/me, PUT /api/profile/me, POST /api/profile/avatar implemented and secured.

 User entity extended safely; migration applied; no breaking existing auth.

 Avatar file storage uses sanitized filenames in wwwroot/uploads/avatars.

 Audit logs for updates/uploads.

5) Nice-to-haves (non-blocking)

Cropper for avatar (later).

Drag & drop upload.

Blue theme tokenization via CSS variables.

Show initials avatar when no image is set.

6) Commands (reference)
# Backend
dotnet ef migrations add UserProfile_Fields -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet ef database update -p TechPrep.Infrastructure -s TechPrep.API -c TechPrepDbContext
dotnet run --project src/TechPrep.API

# Frontend
npm run dev


If you want, I can draft the TopBar.tsx skeleton and the ProfilePage.tsx form with Bootstrap classes and the vanilla dropdown toggle logic ready to paste.