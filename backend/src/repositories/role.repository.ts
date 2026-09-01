import { Db } from '../config/db';
import { Role, RoleName } from '../entities/role.entity';

interface RoleRow {
  id: string;
  name: RoleName;
  created_at: Date;
}

function mapRow(row: RoleRow): Role {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export class RoleRepository {
  constructor(private readonly db: Db) {}

  async findByName(name: RoleName): Promise<Role | null> {
    const result = await this.db.query<RoleRow>(
      `SELECT id, name, created_at
         FROM roles
        WHERE name = $1
        LIMIT 1`,
      [name],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findAll(): Promise<Role[]> {
    const result = await this.db.query<RoleRow>(
      `SELECT id, name, created_at
         FROM roles
        ORDER BY name ASC`,
    );
    return result.rows.map(mapRow);
  }

  async assignToUser(userId: string, roleId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, roleId],
    );
  }

  async findRolesByUserId(userId: string): Promise<RoleName[]> {
    const result = await this.db.query<{ name: RoleName }>(
      `SELECT r.name
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = $1
        ORDER BY r.name ASC`,
      [userId],
    );
    return result.rows.map((row) => row.name);
  }
}
