import { Injectable, signal } from '@angular/core';

export interface SidebarItem {
  label: string;
  route: string;
  icon?: string;
}

export interface SidebarConfig {
  title?: string;
  items: SidebarItem[];
}

const DASHBOARD_SVG = '<path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M15 4l3 3-3 3M9 20l-3-3 3-3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
const INGRESOS_SVG = '<circle cx="9" cy="9" r="6" stroke="#fff" stroke-width="1.6"/><circle cx="15" cy="15" r="6" stroke="#fff" stroke-width="1.6"/>';
const GASTOS_SVG = '<path d="M6 3h9l3 3v15H6z" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 10h6M9 14h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>';
const INFORMES_SVG = '<path d="M5 20V10M12 20V4M19 20v-7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly title = signal<string | undefined>(undefined);
  readonly items = signal<SidebarItem[]>([]);

  setDashboard(): void {
    this.title.set(undefined);
    this.items.set([
      { label: 'ÚLTIMOS MOVIMIENTOS', route: '/dashboard/movements', icon: DASHBOARD_SVG },
      { label: 'ÚLTIMOS INGRESOS', route: '/dashboard/income', icon: INGRESOS_SVG },
      { label: 'ÚLTIMOS GASTOS', route: '/dashboard/expenses', icon: GASTOS_SVG },
      { label: 'INFORMES', route: '/dashboard/reports', icon: INFORMES_SVG },
    ]);
  }

  setPeriods(): void {
    this.title.set('PERÍODOS');
    this.items.set([
      { label: 'NUEVO PERÍODO', route: '/periods/new' },
      { label: 'FINALIZAR PERÍODO ACTUAL', route: '/periods/finalize' },
      { label: 'MODIFICAR PERÍODO ACTUAL', route: '/periods/edit' },
      { label: 'HISTORIAL DE PERÍODOS', route: '/periods/history' },
    ]);
  }

  setMovements(): void {
    this.title.set('MOVIMIENTOS');
    this.items.set([
      { label: 'INGRESOS', route: '/movements/income' },
      { label: 'GASTOS', route: '/movements/expenses' },
      { label: 'HISTORIAL DE INGRESOS', route: '/movements/history/income' },
      { label: 'HISTORIAL DE GASTOS', route: '/movements/history/expenses' },
    ]);
  }

  setObjectives(): void {
    this.title.set(undefined);
    this.items.set([]);
  }

  clear(): void {
    this.title.set(undefined);
    this.items.set([]);
  }
}
