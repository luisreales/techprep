export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: 'Active' | 'Blocked';
  createdAt: string;
  updatedAt?: string;
  lockoutEnabled?: boolean;
  lockoutEnd?: string;
  specialization?: string;
  yearsOfExperience?: number;
  matchingThreshold?: number;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminUsersFilters {
  q?: string; // search query
  role?: string; // Admin, Student
  status?: string; // Active, Blocked
  page?: number;
  pageSize?: number;
  sort?: string; // email, firstName, lastName, createdAt
}

export interface SetRolesRequest {
  roles: string[];
}

export interface BlockUserRequest {
  blocked: boolean;
  reason?: string;
}

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface ResetPasswordTokenResponse {
  resetToken: string;
}