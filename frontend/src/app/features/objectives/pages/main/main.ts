import { Component, inject, OnInit } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
  selector: 'app-objectives-main',
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class ObjectivesMain implements OnInit {
  private readonly sidebarService = inject(SidebarService);

  ngOnInit(): void {
    this.sidebarService.setObjectives();
  }
}
