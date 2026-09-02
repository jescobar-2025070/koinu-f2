export interface User {
  id: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string | null;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
}