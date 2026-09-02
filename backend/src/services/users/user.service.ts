import { Db, withTransaction } from '../../config/db';
import { UserRepository } from '../../repositories/user.repository';
import { RoleRepository } from '../../repositories/role.repository';
import { User } from '../../entities/user.entity';
import { RoleName } from '../../entities/role.entity';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';

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

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const updated = await this.userRepository.updatePassword(userId, passwordHash);
    if (!updated) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, {
        message: 'Usuario no encontrado.',
        statusCode: 404,
      });
    }
  }

  async listUsers(): Promise<{ user: User; roles: RoleName[] }[]> {
    const users = await this.userRepository.findAll();
    return Promise.all(
      users.map(async (user) => {
        const roles = await this.roleRepository.findRolesByUserId(user.id);
        return { user, roles };
      }),
    );
  }

  async setUserActive(userId: string, isActive: boolean): Promise<{ user: User; roles: RoleName[] }> {
    const updated = await this.userRepository.setActive(userId, isActive);
    if (!updated) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, {
        message: 'Usuario no encontrado.',
        statusCode: 404,
      });
    }
    const roles = await this.roleRepository.findRolesByUserId(updated.id);
    return { user: updated, roles };
  }

  async setUserRoles(userId: string, roleNames: RoleName[]): Promise<{ user: User; roles: RoleName[] }> {
    const validRoles = await this.roleRepository.findAll();
    const validNames = new Set(validRoles.map((role) => role.name));

    for (const roleName of roleNames) {
      if (!validNames.has(roleName)) {
        throw new AppError(ErrorCodes.ROLE_NOT_FOUND, {
          message: `El rol "${roleName}" no existe.`,
          statusCode: 404,
        });
      }
    }

    return withTransaction(async (client) => {
      const userRepo = new UserRepository(client);
      const roleRepo = new RoleRepository(client);

      const user = await userRepo.findById(userId);
      if (!user || user.deletedAt) {
        throw new AppError(ErrorCodes.USER_NOT_FOUND, {
          message: 'Usuario no encontrado.',
          statusCode: 404,
        });
      }

      await roleRepo.removeAllFromUser(userId);
      for (const roleName of roleNames) {
        const role = await roleRepo.findByName(roleName);
        if (role) {
          await roleRepo.assignToUser(userId, role.id);
        }
      }

      return { user, roles: roleNames };
    });
  }

  async softDeleteUser(userId: string, actorId: string): Promise<void> {
    if (userId === actorId) {
      throw new AppError(ErrorCodes.CANNOT_DELETE_SELF, {
        message: 'No puedes eliminar tu propia cuenta.',
        statusCode: 422,
      });
    }

    const deleted = await this.userRepository.softDelete(userId);
    if (!deleted) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, {
        message: 'Usuario no encontrado.',
        statusCode: 404,
      });
    }
  }
}