import { UserResponse } from '../dto/responses/auth/auth-user.response';
import { AuthUser } from '../entities/auth-user';
import { User } from '../entities/user.entity';
import { RoleName } from '../entities/role.entity';

export function toUserResponse(user: User, roles: RoleName[]): UserResponse {
  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    roles,
    createdAt: user.createdAt.toISOString(),
  };
}

export function toAuthUser(user: User, roles: RoleName[]): AuthUser {
  return {
    id: user.id,
    email: user.email,
    roles,
  };
}
