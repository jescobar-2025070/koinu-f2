import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/roles/role.service';
import { pool } from '../config/db';

export class RoleController {
  private readonly roleService: RoleService;

  constructor() {
    this.roleService = new RoleService(pool);
  }

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.roleService.listRoles();
      res.status(200).json({
        roles: roles.map((role) => ({ id: role.id, name: role.name })),
      });
    } catch (error) {
      next(error);
    }
  };
}
