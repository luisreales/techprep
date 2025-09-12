export type JwtPayload = { 
  email?: string; 
  firstName?: string; 
  lastName?: string; 
  role?: string | string[];
  sub?: string;
  exp?: number;
};

export function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}