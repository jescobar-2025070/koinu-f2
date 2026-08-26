import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { SidebarService } from './core/services/sidebar.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly sidebarService = inject(SidebarService);

  ngOnInit(): void {
    void this.authService.ensureInitialized();
  }

  logout(): void {
    void this.authService.logout();
  }
}
