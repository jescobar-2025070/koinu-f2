import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
  selector: 'app-dashboard-reports',
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class DashboardReports implements OnInit {
  private readonly sidebarService = inject(SidebarService);

  ngOnInit(): void {
    this.sidebarService.setDashboard();
  }
}
