import { pool, withTransaction } from '../src/config/db';
import { RoleRepository } from '../src/repositories/role.repository';
import { UserRepository } from '../src/repositories/user.repository';
import { PeriodoRepository } from '../src/repositories/periodo.repository';
import { CategoriaRepository } from '../src/repositories/categoria.repository';
import { MovimientoRepository } from '../src/repositories/movimiento.repository';
import { ObjetivoRepository } from '../src/repositories/objetivo.repository';
import { hashPassword } from '../src/utils/password.utils';
import { RoleName } from '../src/entities/role.entity';

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@koinu.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'Test1234';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@koinu.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234';

async function seedTestData(): Promise<void> {
  console.log('Iniciando seed de datos de prueba...');

  // 1. Create test users
  const testUser = await createTestUser(TEST_EMAIL, TEST_PASSWORD, 'USR');
  const adminUser = await createTestUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'ADMIN');

  if (!testUser || !adminUser) {
    console.log('Usuarios ya existen, continuando...');
  }

  const userId = testUser?.id || adminUser?.id;
  if (!userId) {
    console.error('No se pudo obtener un ID de usuario válido');
    return;
  }

  // 2. Create categories
  const categories = await createCategories();
  console.log(`Categorías creadas: ${categories.length}`);

  // 3. Create periods
  const periods = await createPeriods(userId);
  console.log(`Períodos creados: ${periods.length}`);

  // 4. Create movements
  const movements = await createMovements(userId, periods, categories);
  console.log(`Movimientos creados: ${movements.length}`);

  // 5. Create objectives
  const objectives = await createObjectives(userId);
  console.log(`Objetivos creados: ${objectives.length}`);

  console.log('\n=== Datos de prueba creados exitosamente ===');
  console.log(`Usuario de prueba: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  console.log(`Administrador: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

async function createTestUser(email: string, password: string, role: RoleName) {
  const userRepository = new UserRepository(pool);
  const existing = await userRepository.findByEmail(email);
  
  if (existing) {
    console.log(`Usuario ${email} ya existe.`);
    return null;
  }

  const passwordHash = await hashPassword(password);

  return await withTransaction(async (client) => {
    const userRepo = new UserRepository(client);
    const roleRepo = new RoleRepository(client);

    const user = await userRepo.create({ email, passwordHash });
    const roleEntity = await roleRepo.findByName(role);
    if (!roleEntity) {
      throw new Error(`El rol ${role} no existe. Ejecuta las migraciones primero.`);
    }
    await roleRepo.assignToUser(user.id, roleEntity.id);
    console.log(`Usuario ${email} creado con rol ${role}.`);
    return user;
  });
}

async function createCategories() {
  const categoriaRepo = new CategoriaRepository(pool);
  const categories = [
    { name: 'Freelance', type: 'ingreso' as const },
    { name: 'Salario', type: 'ingreso' as const },
    { name: 'Inversiones', type: 'ingreso' as const },
    { name: 'Otros Ingresos', type: 'ingreso' as const },
    { name: 'Servicios', type: 'gasto' as const },
    { name: 'Equipamiento', type: 'gasto' as const },
    { name: 'Alimentación', type: 'gasto' as const },
    { name: 'Transporte', type: 'gasto' as const },
    { name: 'Servicios Públicos', type: 'gasto' as const },
    { name: 'Entretenimiento', type: 'gasto' as const },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    try {
      const existing = await categoriaRepo.create(cat);
      createdCategories.push(existing);
    } catch (error) {
      // Category might already exist
      console.log(`Categoría ${cat.name} ya existe.`);
    }
  }
  
  return createdCategories;
}

async function createPeriods(userId: string) {
  const periodoRepo = new PeriodoRepository(pool);
  const periods = [
    { year: 2026, month: 6, isOpen: false },
    { year: 2026, month: 7, isOpen: false },
    { year: 2026, month: 8, isOpen: true },
  ];

  const createdPeriods = [];
  for (const period of periods) {
    try {
      const existing = await periodoRepo.findByUserAndPeriod(userId, period.year, period.month);
      if (!existing) {
        const created = await periodoRepo.create({
          userId,
          year: period.year,
          month: period.month,
        });
        createdPeriods.push(created);
      } else {
        createdPeriods.push(existing);
      }
    } catch (error) {
      console.log(`Período ${period.month}/${period.year} ya existe.`);
    }
  }

  return createdPeriods;
}

async function createMovements(userId: string, periods: any[], categories: any[]) {
  const movimientoRepo = new MovimientoRepository(pool);
  const movements = [];

  // Find current open period
  const currentPeriod = periods.find(p => p.isOpen) || periods[periods.length - 1];
  if (!currentPeriod) {
    console.log('No hay períodos disponibles para crear movimientos.');
    return [];
  }

  // Find categories
  const incomeCategories = categories.filter(c => c.type === 'ingreso');
  const expenseCategories = categories.filter(c => c.type === 'gasto');

  const movementData = [
    // Income movements
    { type: 'ingreso', amount: 2375, description: 'DESARROLLO DE SOFTWARE', date: '2026-08-21' },
    { type: 'ingreso', amount: 1710, description: 'DISEÑO DE IDENTIDAD DE MARCA', date: '2026-08-20' },
    { type: 'ingreso', amount: 650, description: 'LICENCIA DE PLANTILLA WEB', date: '2026-08-19' },
    { type: 'ingreso', amount: 855, description: 'MANTENIMIENTO MENSUAL DE SITIO', date: '2026-08-18' },
    { type: 'ingreso', amount: 1200, description: 'CONSULTORÍA EN REDES', date: '2026-08-15' },
    
    // Expense movements
    { type: 'gasto', amount: 480, description: 'LICENCIA ANUAL DE HOSTING', date: '2026-08-22' },
    { type: 'gasto', amount: 620, description: 'MOUSE Y TECLADO ERGONÓMICO', date: '2026-08-20' },
    { type: 'gasto', amount: 750, description: 'CAMPAÑA DE ANUNCIOS EN REDES', date: '2026-08-17' },
    { type: 'gasto', amount: 310, description: 'INTERNET DE OFICINA', date: '2026-08-14' },
    { type: 'gasto', amount: 280, description: 'SUSCRIPCIÓN A HERRAMIENTAS', date: '2026-08-12' },
  ];

  for (const data of movementData) {
    try {
      const categoryList = data.type === 'ingreso' ? incomeCategories : expenseCategories;
      const category = categoryList[0]; // Use first available category
      
      if (!category) {
        console.log(`No hay categoría disponible para ${data.type}`);
        continue;
      }

      const movement = await movimientoRepo.create({
        userId,
        periodoId: currentPeriod.id,
        categoriaId: category.id,
        type: data.type as 'ingreso' | 'gasto',
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
      });
      movements.push(movement);
    } catch (error) {
      console.log(`Error creando movimiento: ${error}`);
    }
  }

  return movements;
}

async function createObjectives(userId: string) {
  const objetivoRepo = new ObjetivoRepository(pool);
  const objectives = [
    {
      name: 'Fondo de emergencia',
      targetAmount: 10000,
      currentAmount: 3500,
      deadline: '2026-12-31',
    },
    {
      name: 'Vacaciones',
      targetAmount: 5000,
      currentAmount: 1200,
      deadline: '2027-06-30',
    },
    {
      name: 'Nuevo equipo de trabajo',
      targetAmount: 8000,
      currentAmount: 2000,
      deadline: null,
    },
  ];

  const createdObjectives = [];
  for (const obj of objectives) {
    try {
      const objetivo = await objetivoRepo.create({
        userId,
        name: obj.name,
        targetAmount: obj.targetAmount,
        deadline: obj.deadline ? new Date(obj.deadline) : undefined,
      });
      
      // Add initial deposit
      if (obj.currentAmount > 0) {
        await objetivoRepo.deposit(objetivo.id, obj.currentAmount);
      }
      
      createdObjectives.push(objetivo);
    } catch (error) {
      console.log(`Error creando objetivo: ${error}`);
    }
  }

  return createdObjectives;
}

seedTestData()
  .catch((error) => {
    console.error('Fallo al crear datos de prueba:', error);
    process.exit(1);
  })
  .finally(() => void pool.end());