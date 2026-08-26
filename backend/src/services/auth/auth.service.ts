import { pool, withTransaction } from '../../config/db';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../errors/error-codes';
import { RoleName } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { AuthUser } from '../../entities/auth-user';
import { RegisterRequest } from '../../dto/requests/auth/register.dto';
import { LoginRequest } from '../../dto/requests/auth/login.dto';
import { UserService } from '../users/user.service';
import { RoleRepository } from '../../repositories/role.repository';
import { UserRepository } from '../../repositories/user.repository';
import { hashPassword, comparePassword } from '../../utils/password.utils';
import { toAuthUser } from '../../mappers/user.mapper';

const DEFAULT_REGISTER_ROLE: RoleName = 'USR';

export class AuthService {
  private readonly userService: UserService;

  constructor() {
    this.userService = new UserService(pool);
  }

  async register(data: RegisterRequest): Promise<{ user: User; roles: RoleName[] }> {
    const existing = await this.userService.getUserByEmailWithRoles(data.email);
    if (existing) {
      throw new AppError(ErrorCodes.EMAIL_ALREADY_REGISTERED, {
        message: 'Ya existe una cuenta registrada con ese correo electrónico.',
        statusCode: 409,
      });
    }

    const passwordHash = await hashPassword(data.password);

    return withTransaction(async (client) => {
      const userRepository = new UserRepository(client);
      const roleRepository = new RoleRepository(client);

      const user = await userRepository.create({
        email: data.email,
        passwordHash,
      });

      const role = await roleRepository.findByName(DEFAULT_REGISTER_ROLE);
      if (!role) {
        throw new AppError(ErrorCodes.INTERNAL_ERROR, {
          message: 'El rol por defecto del sistema no está configurado.',
          statusCode: 500,
        });
      }

      await roleRepository.assignToUser(user.id, role.id);

      return { user, roles: [role.name] };
    });
  }

  async login(data: LoginRequest): Promise<{ authUser: AuthUser; user: User }> {
    const account = await this.userService.getUserByEmailWithRoles(data.email);
    if (!account || account.user.deletedAt) {
      throw this.invalidCredentials();
    }

    const passwordMatches = await comparePassword(data.password, account.user.passwordHash);
    if (!passwordMatches) {
      throw this.invalidCredentials();
    }

    if (!account.user.isActive) {
      throw new AppError(ErrorCodes.ACCOUNT_DISABLED, {
        message: 'La cuenta está desactivada. Contacta al administrador.',
        statusCode: 403,
      });
    }

    return {
      authUser: toAuthUser(account.user, account.roles),
      user: account.user,
    };
  }

  private invalidCredentials(): AppError {
    return new AppError(ErrorCodes.INVALID_CREDENTIALS, {
      message: 'Credenciales incorrectas.',
      statusCode: 401,
    });
  }
}
