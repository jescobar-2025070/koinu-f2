import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  // Dashboard routes
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'dashboard/movements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/movements/movements').then((m) => m.DashboardMovements),
  },
  {
    path: 'dashboard/income',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/income/income').then((m) => m.DashboardIncome),
  },
  {
    path: 'dashboard/expenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/expenses/expenses').then((m) => m.DashboardExpenses),
  },
  {
    path: 'dashboard/reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/reports/reports').then((m) => m.DashboardReports),
  },
  // Periods routes
  {
    path: 'periods',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/periods/pages/overview/overview').then((m) => m.PeriodsOverview),
  },
  {
    path: 'periods/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/periods/pages/new/new').then((m) => m.PeriodsNew),
  },
  {
    path: 'periods/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/periods/pages/edit/edit').then((m) => m.PeriodsEdit),
  },
  {
    path: 'periods/finalize',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/periods/pages/finalize/finalize').then((m) => m.PeriodsFinalize),
  },
  {
    path: 'periods/history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/periods/pages/history/history').then((m) => m.PeriodsHistory),
  },
  // Movements routes
  {
    path: 'movements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/movements/pages/income/income').then((m) => m.MovementsIncome),
  },
  {
    path: 'movements/income',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/movements/pages/income/income').then((m) => m.MovementsIncome),
  },
  {
    path: 'movements/expenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/movements/pages/expenses/expenses').then((m) => m.MovementsExpenses),
  },
  {
    path: 'movements/history/income',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/movements/pages/history-income/history-income').then((m) => m.MovementsHistoryIncome),
  },
  {
    path: 'movements/history/expenses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/movements/pages/history-expenses/history-expenses').then((m) => m.MovementsHistoryExpenses),
  },
  // Objectives routes
  {
    path: 'objectives',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/objectives/pages/main/main').then((m) => m.ObjectivesMain),
  },
  // Budget routes
  {
    path: 'budget',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/budget/pages/main/budget').then((m) => m.BudgetMain),
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/admin/admin').then((m) => m.Admin),
  },
  { path: '**', redirectTo: 'login' },
];
