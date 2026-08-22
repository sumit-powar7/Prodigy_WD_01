export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface TokenDetails {
  storage: string;
  sameSite: string;
  httpOnly: boolean;
  expiresIn: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'REGISTER' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'ROLE_CHANGE' | 'ADMIN_ACCESS';
  userEmail: string;
  ip: string;
  details: string;
  severity: 'info' | 'warning' | 'high';
}

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  standardUserCount: number;
  activeSessions: number;
  failedLoginAttempts: number;
  bcryptRounds: number;
  jwtSecurity: string;
  uptime: number;
}
