import { RoleName } from '../../../entities/role.entity';

export interface UserResponse {
  id: string;
  email: string;
  isActive: boolean;
  roles: RoleName[];
  createdAt: string;
}

export interface AuthUserResponse {
  user: UserResponse;
}
