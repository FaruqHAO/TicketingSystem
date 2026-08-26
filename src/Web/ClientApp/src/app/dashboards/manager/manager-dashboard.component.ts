import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassRingComponent } from '../../shared/components/glass-ring/glass-ring.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { MANAGER_NAV } from '../../shared/data/dashboard-nav';
import { DESK_METRICS, QUEUE_LOAD } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

/** The desk at a glance: whether we are keeping the promise, and where we are not. */
@Component({
  selector: 'app-manager-dashboard',
  imports: [
    RouterLink,
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassButtonComponent,
    GlassBadgeComponent,
    GlassRingComponent
  ],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent {
  protected readonly nav = MANAGER_NAV;
  protected readonly metrics = DESK_METRICS;
  protected readonly queues = QUEUE_LOAD;

  /** The ring reads a fraction, the same scale it uses for time left on a ticket. */
  protected readonly attainment = computed(() => this.metrics.slaAttainment / 100);
  protected readonly onTarget = computed(() => this.metrics.slaAttainment >= this.metrics.slaTarget);
  protected readonly shortfall = computed(() => (this.metrics.slaTarget - this.metrics.slaAttainment).toFixed(1));

  protected readonly atRisk = computed(() => this.queues.reduce((sum, q) => sum + q.atRisk, 0));
  protected readonly breached = computed(() => this.queues.reduce((sum, q) => sum + q.breached, 0));

  /** Bars are relative to the busiest queue, so the tallest is always full width. */
  private readonly busiest = computed(() => Math.max(...this.queues.map(q => q.open)));

  protected readonly reports = [
    { name: 'Weekly SLA summary', period: 'Mon 18 – Sun 24 Aug', rows: 412 },
    { name: 'First response by queue', period: 'Rolling 30 days', rows: 1206 },
    { name: 'Reopened tickets', period: 'Rolling 30 days', rows: 24 },
    { name: 'Agent workload', period: 'This week', rows: 11 }
  ];

  protected load(open: number): number {
    return (open / this.busiest()) * 100;
  }

  protected share(part: number, open: number): number {
    return open === 0 ? 0 : (part / open) * 100;
  }
}
