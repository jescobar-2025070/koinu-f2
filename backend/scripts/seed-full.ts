import { pool, withTransaction } from '../src/config/db';
import { RoleRepository } from '../src/repositories/role.repository';
import { UserRepository } from '../src/repositories/user.repository';
import { PeriodoRepository } from '../src/repositories/periodo.repository';
import { CategoriaIngresoRepository } from '../src/repositories/categoria-ingreso.repository';
import { CategoriaGastoRepository } from '../src/repositories/categoria-gasto.repository';
import { MovimientoRepository } from '../src/repositories/movimiento.repository';
import { DetalleIngresoRepository } from '../src/repositories/detalle-ingreso.repository';
import { ObjetivoRepository } from '../src/repositories/objetivo.repository';
import { hashPassword } from '../src/utils/password.utils';
import { RoleName } from '../src/entities/role.entity';

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@koinu.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'Test1234';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@koinu.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234';

async function createTestUser(email: string, password: string, role: RoleName) {
  const userRepository = new UserRepository(pool);
  const existing = await userRepository.findByEmail(email);

  if (existing) {
    console.log(`Usuario ${email} ya existe.`);
    return existing;
  }

  const passwordHash = await hashPassword(password);

  return withTransaction(async (client) => {
    const userRepo = new UserRepository(client);
    const roleRepo = new RoleRepository(client);
    const ingRepo = new CategoriaIngresoRepository(client);
    const gasRepo = new CategoriaGastoRepository(client);

    const user = await userRepo.create({ email, passwordHash });
    const roleEntity = await roleRepo.findByName(role);
    if (!roleEntity) {
      throw new Error(`El rol ${role} no existe. Ejecuta las migraciones primero.`);
    }
    await roleRepo.assignToUser(user.id, roleEntity.id);
    await ingRepo.createDefaultsForUser(user.id);
    await gasRepo.createDefaultsForUser(user.id);
    console.log(`Usuario ${email} creado con rol ${role}.`);
    return user;
  });
}

async function seedFull(): Promise<void> {
  console.log('Iniciando seed completo...');

  const testUser = await createTestUser(TEST_EMAIL, TEST_PASSWORD, 'USR');
  const adminUser = await createTestUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'ADMIN');

  const userId = testUser?.id ?? adminUser?.id;
  if (!userId) {
    console.error('No se pudo obtener un ID de usuario válido');
    return;
  }

  const periodoRepo = new PeriodoRepository(pool);
  const ingRepo = new CategoriaIngresoRepository(pool);
  const gasRepo = new CategoriaGastoRepository(pool);
  const movRepo = new MovimientoRepository(pool);
  const detRepo = new DetalleIngresoRepository(pool);
  const objRepo = new ObjetivoRepository(pool);

  // 1. Create periods (one DRAFT, one ACTIVE, one FINISHED)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const draftPeriod = await periodoRepo.create({
    userId,
    name: `Borrador ${currentMonth}/${currentYear}`,
    startDate: new Date(currentYear, currentMonth - 1, 1),
    endDate: new Date(currentYear, currentMonth, 0),
    status: 'DRAFT',
  });

  const activePeriod = await periodoRepo.findActive(userId) ?? await periodoRepo.create({
    userId,
    name: `Agosto ${currentYear}`,
    startDate: new Date(currentYear, 7, 1),
    endDate: new Date(currentYear, 8, 0),
    status: 'ACTIVE',
  });
  await periodoRepo.setStatus(activePeriod.id, 'ACTIVE');

  const finishedPeriod = await periodoRepo.create({
    userId,
    name: `Julio ${currentYear - 1}`,
    startDate: new Date(currentYear - 1, 6, 1),
    endDate: new Date(currentYear - 1, 7, 0),
    status: 'FINISHED',
  });

  const activeId = activePeriod.id;
  const finishedId = finishedPeriod.id;

  console.log(`Períodos creados: DRAFT=${draftPeriod.id}, ACTIVE=${activeId}, FINISHED=${finishedId}`);

  // 2. Categories per user
  const ingCategorias = await ingRepo.findByUser(userId);
  const gasCategorias = await gasRepo.findByUser(userId);
  const ingCat = ingCategorias[0] ?? (await ingRepo.create({ userId, name: 'Salario' }));
  const gasCat = gasCategorias[0] ?? (await gasRepo.create({ userId, name: 'Alimentación' }));

  // 3. Income movements with income_details (net = gross - retention)
  const income = await movRepo.create({
    userId,
    periodoId: activeId,
    type: 'INCOME',
    incomeCategoryId: ingCat.id,
    amount: 2256.25,
    description: 'DESARROLLO DE SOFTWARE',
    date: new Date(currentYear, 7, 21),
  });
  await detRepo.create({
    movementId: income.id,
    taxTreatmentId: null,
    grossAmount: 2375,
    retentionAmount: 118.75,
    netAmount: 2256.25,
  });

  const income2 = await movRepo.create({
    userId,
    periodoId: activeId,
    type: 'INCOME',
    incomeCategoryId: ingCat.id,
    amount: 1710,
    description: 'DISEÑO DE IDENTIDAD DE MARCA',
    date: new Date(currentYear, 7, 20),
  });
  await detRepo.create({
    movementId: income2.id,
    taxTreatmentId: null,
    grossAmount: 1710,
    retentionAmount: 0,
    netAmount: 1710,
  });

  // Expense movements
  await movRepo.create({
    userId,
    periodoId: activeId,
    type: 'EXPENSE',
    expenseCategoryId: gasCat.id,
    amount: 480,
    description: 'LICENCIA ANUAL DE HOSTING',
    date: new Date(currentYear, 7, 22),
  });
  await movRepo.create({
    userId,
    periodoId: activeId,
    type: 'EXPENSE',
    expenseCategoryId: gasCat.id,
    amount: 620,
    description: 'MOUSE Y TECLADO ERGONÓMICO',
    date: new Date(currentYear, 7, 20),
  });
  await movRepo.create({
    userId,
    periodoId: activeId,
    type: 'EXPENSE',
    expenseCategoryId: gasCat.id,
    amount: 310,
    description: 'INTERNET DE OFICINA',
    date: new Date(currentYear, 7, 14),
  });

  // 4. Objectives
  const objetivo = await objRepo.create({
    userId,
    name: 'Fondo de emergencia',
    targetAmount: 10000,
    deadline: new Date(currentYear, 11, 31),
  });
  await objRepo.deposit(objetivo.id, 3500);

  console.log('\n=== Datos de prueba creados exitosamente ===');
  console.log(`Usuario de prueba: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  console.log(`Administrador: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Período activo: ${activePeriod.name}`);
}

seedFull()
  .catch((error) => {
    console.error('Fallo al crear datos de prueba:', error);
    process.exit(1);
  })
  .finally(() => void pool.end());
