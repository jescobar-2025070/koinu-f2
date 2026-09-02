import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BudgetMain } from './budget';
import { BudgetService } from '../../../../core/services/budget.service';
import { PeriodoService } from '../../../../core/services/periodo.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { SidebarService } from '../../../../core/services/sidebar.service';
import {
  AsignacionPresupuesto,
  BudgetData,
  Categoria,
  OverrunsData,
  Periodo,
} from '../../../../core/models/api.models';

const periodo: Periodo = {
  id: 'p-1',
  userId: 'u-1',
  name: 'Enero 2026',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-31T23:59:59.999Z',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

const categoria: Categoria = {
  id: 'c-1',
  userId: null,
  name: 'Alimentación',
  isDefault: true,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const budgetData: BudgetData = {
  presupuesto: {
    id: 'b-1',
    periodoId: 'p-1',
    totalAmount: 5000,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  asignaciones: [
    { id: 'a-1', presupuestoId: 'b-1', categoriaGastoId: 'c-1', amount: 2000, createdAt: '2026-01-02T00:00:00.000Z' } as AsignacionPresupuesto,
  ],
  asignadoTotal: 2000,
  excedenteTotal: 0,
};

const noBudget: BudgetData = {
  presupuesto: null,
  asignaciones: [],
  asignadoTotal: 0,
  excedenteTotal: 0,
};

type Mock<T> = { [K in keyof T]: ReturnType<typeof vi.fn> };

async function settle(): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

const overruns: OverrunsData = {
  excedenteTotal: 300,
  excedentes: [
    {
      id: 'o-1',
      presupuestoId: 'b-1',
      movimientoId: 'm-1',
      amount: 300,
      createdAt: '2026-01-10T12:00:00.000Z',
    },
  ],
};

describe('BudgetMain', () => {
  let fixture: ComponentFixture<BudgetMain>;
  let component: BudgetMain;
  let budgetService: Mock<BudgetService>;
  let periodoService: Mock<PeriodoService>;
  let categoriaService: Mock<CategoriaService>;
  let sidebarService: Mock<SidebarService>;

  beforeEach(() => {
    budgetService = {
      getBudget: vi.fn(),
      createBudget: vi.fn(),
      updateBudget: vi.fn(),
      createAllocation: vi.fn(),
      updateAllocation: vi.fn(),
      deleteAllocation: vi.fn(),
      getOverruns: vi.fn(),
    };
    periodoService = { list: vi.fn() } as Mock<PeriodoService>;
    categoriaService = { listExpense: vi.fn() } as Mock<CategoriaService>;
    sidebarService = { setDashboard: vi.fn() } as Mock<SidebarService>;

    TestBed.configureTestingModule({
      imports: [BudgetMain],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BudgetService, useValue: budgetService },
        { provide: PeriodoService, useValue: periodoService },
        { provide: CategoriaService, useValue: categoriaService },
        { provide: SidebarService, useValue: sidebarService },
      ],
    });

    fixture = TestBed.createComponent(BudgetMain);
    component = fixture.componentInstance;
  });

  it('carga períodos, activa el período ACTIVE y renderiza el presupuesto', async () => {
    periodoService.list.mockResolvedValue([periodo]);
    categoriaService.listExpense.mockResolvedValue([categoria]);
    budgetService.getBudget.mockResolvedValue(budgetData);
    budgetService.getOverruns.mockResolvedValue({ excedenteTotal: 0, excedentes: [] });

    fixture.detectChanges();
    await settle();

    expect(component.periodos).toEqual([periodo]);
    expect(component.selectedPeriodId).toBe('p-1');
    expect(component.budget).toEqual(budgetData);
    expect(sidebarService.setDashboard).toHaveBeenCalled();

    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Enero 2026');
    expect(text).toContain('Q 5,000.00');
    expect(text).toContain('Actualizar Presupuesto');
  });

  it('muestra el mensaje vacío cuando no hay períodos', async () => {
    periodoService.list.mockResolvedValue([]);

    fixture.detectChanges();
    await settle();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Primero crea un período para poder definir un presupuesto.');
    expect(budgetService.getBudget).not.toHaveBeenCalled();
  });

  it('saveTotal crea el presupuesto cuando aún no existe', async () => {
    periodoService.list.mockResolvedValue([periodo]);
    categoriaService.listExpense.mockResolvedValue([]);
    budgetService.getBudget.mockResolvedValue(noBudget);
    budgetService.getOverruns.mockResolvedValue({ excedenteTotal: 0, excedentes: [] });
    budgetService.createBudget.mockResolvedValue(undefined);

    fixture.detectChanges();
    await settle();

    component.totalInput = 3000;
    await component.saveTotal();

    expect(budgetService.createBudget).toHaveBeenCalledWith('p-1', 3000);
    expect(budgetService.updateBudget).not.toHaveBeenCalled();
    expect(component.msg).toBe('Presupuesto guardado correctamente.');
  });

  it('saveTotal actualiza el presupuesto cuando ya existe', async () => {
    periodoService.list.mockResolvedValue([periodo]);
    categoriaService.listExpense.mockResolvedValue([]);
    budgetService.getBudget.mockResolvedValue(budgetData);
    budgetService.getOverruns.mockResolvedValue({ excedenteTotal: 0, excedentes: [] });
    budgetService.updateBudget.mockResolvedValue(undefined);

    fixture.detectChanges();
    await settle();

    component.totalInput = 6000;
    await component.saveTotal();

    expect(budgetService.updateBudget).toHaveBeenCalledWith('p-1', 6000);
    expect(budgetService.createBudget).not.toHaveBeenCalled();
  });

  it('isActivePeriod es true para ACTIVE y DRAFT, false para FINISHED', () => {
    component.periodos = [periodo];
    component.selectedPeriodId = 'p-1';
    expect(component.isActivePeriod()).toBe(true);

    component.periodos = [
      { ...periodo, id: 'p-2', status: 'DRAFT' },
      { ...periodo, id: 'p-3', status: 'FINISHED' },
    ];
    component.selectedPeriodId = 'p-2';
    expect(component.isActivePeriod()).toBe(true);

    component.selectedPeriodId = 'p-3';
    expect(component.isActivePeriod()).toBe(false);
  });

  it('addAllocation valida categoría y monto antes de llamar al servicio', async () => {
    component.selectedPeriodId = 'p-1';
    component.allocationCategoryId = '';
    component.allocationAmount = 0;

    await component.addAllocation();

    expect(budgetService.createAllocation).not.toHaveBeenCalled();
    expect(component.allocationMsg).toContain('Selecciona una categoría');
  });

  it('addAllocation registra la asignación con valores válidos', async () => {
    periodoService.list.mockResolvedValue([periodo]);
    categoriaService.listExpense.mockResolvedValue([categoria]);
    budgetService.getBudget.mockResolvedValue(noBudget);
    budgetService.getOverruns.mockResolvedValue({ excedenteTotal: 0, excedentes: [] });
    budgetService.createAllocation.mockResolvedValue({} as AsignacionPresupuesto);

    fixture.detectChanges();
    await settle();

    component.allocationCategoryId = 'c-1';
    component.allocationAmount = 1500;
    await component.addAllocation();

    expect(budgetService.createAllocation).toHaveBeenCalledWith('p-1', 'c-1', 1500);
    expect(component.allocationMsg).toBe('Asignación registrada.');
    expect(component.allocationAmount).toBe(0);
  });

  it('getCategoryName devuelve el nombre o un guion', () => {
    component.categoriasGasto = [categoria];
    expect(component.getCategoryName('c-1')).toBe('Alimentación');
    expect(component.getCategoryName('nope')).toBe('—');
  });

  it('formatCurrency formatea en quetzales', () => {
    expect(component.formatCurrency(1234.56)).toBe('Q 1,234.56');
  });

  it('formatDate formatea en dd/mm/yyyy', () => {
    expect(component.formatDate('2026-01-10T12:00:00.000Z')).toBe('10/01/2026');
  });
});