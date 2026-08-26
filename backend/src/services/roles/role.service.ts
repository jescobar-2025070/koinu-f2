import { Db } from '../../config/db';
import { RoleRepository } from '../../repositories/role.repository';
import { Role } from '../../entities/role.entity';

export class RoleService {
  private readonly roleRepository: RoleRepository;

  constructor(db: Db) {
    this.roleRepository = new RoleRepository(db);
  }

  async listRoles(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }
}
