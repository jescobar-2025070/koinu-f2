import { pool, withTransaction } from '../src/config/db';
import { RoleRepository } from '../src/repositories/role.repository';
import { UserRepository } from '../src/repositories/user.repository';
import { hashPassword } from '../src/utils/password.utils';
import { RoleName } from '../src/entities/role.entity';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@finanzas.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

async function seedAdmin(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD es obligatorio para ejecutar el seed del administrador.');
  }

  const userRepository = new UserRepository(pool);
  const existing = await userRepository.findByEmail(ADMIN_EMAIL);
  if (existing) {
    console.log(`El administrador ${ADMIN_EMAIL} ya existe.`);
    return;
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  await withTransaction(async (client) => {
    const userRepo = new UserRepository(client);
    const roleRepo = new RoleRepository(client);

    const user = await userRepo.create({ email: ADMIN_EMAIL, passwordHash });
    const role = await roleRepo.findByName('ADMIN' as RoleName);
    if (!role) {
      throw new Error('El rol ADMIN no existe. Ejecuta las migraciones primero.');
    }
    await roleRepo.assignToUser(user.id, role.id);
    console.log(`Administrador ${ADMIN_EMAIL} creado.`);
    console.log(`Contraseña del administrador es ${ADMIN_PASSWORD}.`);
  });
}

seedAdmin()
  .catch((error) => {
    console.error('Fallo al crear el administrador:', error);
    process.exit(1);
  })
  .finally(() => void pool.end());
