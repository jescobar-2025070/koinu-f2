import { pool } from '../src/config/db';
import { config } from '../src/config/env';
import { applyMigrations } from '../src/utils/migrations';
import { hashPassword } from '../src/utils/password.utils';
import { UserRepository } from '../src/repositories/user.repository';
import { RoleRepository } from '../src/repositories/role.repository';
import { withTransaction } from '../src/config/db';
import { RoleName } from '../src/entities/role.entity';

let setupDone = false;

export async function setupTestDb(): Promise<void> {
  if (setupDone) {
    return;
  }
  setupDone = true;

  await applyMigrations(config.databaseUrl);

  await pool.query(`
    TRUNCATE TABLE refresh_tokens, user_roles, users, roles RESTART IDENTITY CASCADE
  `);
  await pool.query(`INSERT INTO roles (name) VALUES ('ADMIN'), ('USR')`);
  await pool.query(`
    TRUNCATE TABLE categorias_ingreso, categorias_gasto RESTART IDENTITY CASCADE
  `);
  await pool.query(`
    INSERT INTO categorias_ingreso (user_id, name, is_default) VALUES
      (NULL, 'Salario', TRUE),
      (NULL, 'Freelance', TRUE),
      (NULL, 'Inversiones', TRUE),
      (NULL, 'Otros Ingresos', TRUE)
  `);
  await pool.query(`
    INSERT INTO categorias_gasto (user_id, name, is_default) VALUES
      (NULL, 'Alimentación', TRUE),
      (NULL, 'Transporte', TRUE),
      (NULL, 'Educación', TRUE),
      (NULL, 'Servicios', TRUE),
      (NULL, 'Otros Gastos', TRUE)
  `);
}

let emailCounter = 0;

export function uniqueEmail(): string {
  emailCounter += 1;
  return `user_${Date.now()}_${emailCounter}@test.local`;
}

export async function createUserWithRole(email: string, password: string, role: RoleName): Promise<string> {
  const passwordHash = await hashPassword(password);
  return withTransaction(async (client) => {
    const userRepo = new UserRepository(client);
    const roleRepo = new RoleRepository(client);
    const user = await userRepo.create({ email, passwordHash });
    const roleRow = await roleRepo.findByName(role);
    if (!roleRow) {
      throw new Error(`Rol ${role} no encontrado`);
    }
    await roleRepo.assignToUser(user.id, roleRow.id);
    return user.id;
  });
}

export async function deactivateUser(userId: string): Promise<void> {
  await pool.query(`UPDATE users SET is_active = FALSE WHERE id = $1`, [userId]);
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const result = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [email]);
  return result.rows[0]?.id ?? null;
}
