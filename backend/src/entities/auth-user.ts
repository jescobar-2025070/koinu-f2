import { RoleName } from './role.entity';

export interface AuthUser {
  id: string;
  email: string;
  roles: RoleName[];
}
