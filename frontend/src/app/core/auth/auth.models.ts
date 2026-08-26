export interface User {
  id: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  user: User;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}
