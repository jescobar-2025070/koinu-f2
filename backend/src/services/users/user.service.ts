import { Db } from '../../config/db';
import { UserRepository } from '../../repositories/user.repository';
import { RoleRepository } from '../../repositories/role.repository';
import { User } from '../../entities/user.entity';
import { RoleName } from '../../entities/role.entity';

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;

  constructor(db: Db) {
    this.userRepository = new UserRepository(db);
    this.roleRepository = new RoleRepository(db);
  }

  async getUserWithRoles(id: string): Promise<{ user: User; roles: RoleName[] } | null> {
    const user = await this.userRepository.findById(id);
    if (!user || user.deletedAt) {
      return null;
    }
    const roles = await this.roleRepository.findRolesByUserId(user.id);
    return { user, roles };
  }

  async getUserByEmailWithRoles(
    email: string,
  ): Promise<{ user: User; roles: RoleName[] } | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    const roles = await this.roleRepository.findRolesByUserId(user.id);
    return { user, roles };
  }
}
