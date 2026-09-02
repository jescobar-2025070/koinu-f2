import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { AdminService } from '../../../../core/services/admin.service';
import { SystemService } from '../../../../core/services/system.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { User } from '../../../../core/auth/auth.models';
import { SystemHealth } from '../../../../core/models/api.models';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly systemService = inject(SystemService);
  private readonly sidebarService = inject(SidebarService);
  private readonly cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  rolesModel = new Map<string, { ADMIN: boolean; USR: boolean }>();
  busy = new Map<string, boolean>();
  rowMsg = new Map<string, string>();
  loading = true;
  health: SystemHealth | null = null;

  ngOnInit(): void {
    this.sidebarService.setDashboard();
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const [users, health] = await Promise.all([
        this.adminService.listUsers(),
        this.systemService.health().catch(() => null),
      ]);
      this.users = users;
      this.health = health;
      for (const u of users) {
        this.rolesModel.set(u.id, {
          ADMIN: u.roles.includes('ADMIN'),
          USR: u.roles.includes('USR'),
        });
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  isSelf(id: string): boolean {
    return id === this.authService.user()?.id;
  }

  async toggleActive(u: User): Promise<void> {
    this.setBusy(u.id, true);
    try {
      const updated = await this.adminService.setActive(u.id, !u.isActive);
      this.replaceUser(updated);
      this.rowMsg.set(u.id, updated.isActive ? 'Cuenta activada.' : 'Cuenta desactivada.');
    } catch (e: any) {
      this.rowMsg.set(u.id, e?.error?.error?.message || 'No se pudo actualizar la cuenta.');
    } finally {
      this.setBusy(u.id, false);
      this.cdr.markForCheck();
    }
  }

  async saveRoles(u: User): Promise<void> {
    const model = this.rolesModel.get(u.id);
    if (!model) {
      return;
    }
    const roles: string[] = [];
    if (model.ADMIN) {
      roles.push('ADMIN');
    }
    if (model.USR) {
      roles.push('USR');
    }
    if (roles.length === 0) {
      this.rowMsg.set(u.id, 'Debes conservar al menos un rol.');
      return;
    }
    this.setBusy(u.id, true);
    try {
      const updated = await this.adminService.setRoles(u.id, roles);
      this.replaceUser(updated);
      this.rowMsg.set(u.id, 'Roles actualizados.');
    } catch (e: any) {
      this.rowMsg.set(u.id, e?.error?.error?.message || 'No se pudieron actualizar los roles.');
    } finally {
      this.setBusy(u.id, false);
      this.cdr.markForCheck();
    }
  }

  async deleteUser(u: User): Promise<void> {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.email}? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.setBusy(u.id, true);
    try {
      await this.adminService.deleteUser(u.id);
      this.users = this.users.filter((x) => x.id !== u.id);
      this.rolesModel.delete(u.id);
    } catch (e: any) {
      this.rowMsg.set(u.id, e?.error?.error?.message || 'No se pudo eliminar la cuenta.');
    } finally {
      this.setBusy(u.id, false);
      this.cdr.markForCheck();
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  private replaceUser(updated: User): void {
    const index = this.users.findIndex((x) => x.id === updated.id);
    if (index >= 0) {
      this.users[index] = updated;
    }
  }

  private setBusy(id: string, value: boolean): void {
    this.busy.set(id, value);
    if (!value) {
      setTimeout(() => {
        this.rowMsg.delete(id);
        this.cdr.markForCheck();
      }, 4000);
    }
  }
}