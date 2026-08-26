import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassRingComponent } from '../../shared/components/glass-ring/glass-ring.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { TicketTableComponent } from '../../shared/components/ticket-table/ticket-table.component';
import { AGENT_NAV } from '../../shared/data/dashboard-nav';
import { ASSIGNED_TICKETS, TICKET_POOL } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

/** An agent's own queue, ordered by how little time is left on it. */
@Component({
  selector: 'app-agent-dashboard',
  imports: [
    RouterLink,
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassButtonComponent,
    GlassBadgeComponent,
    GlassRingComponent,
    TicketTableComponent
  ],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss'
})
export class AgentDashboardComponent {
  protected readonly nav = AGENT_NAV;

  /** Least time left first: the queue should read as a to-do list, not an inbox. */
  protected readonly queue = computed(() => [...ASSIGNED_TICKETS].sort((a, b) => a.remaining - b.remaining));
  protected readonly atRisk = computed(() => this.queue().filter(t => t.remaining <= 0.25).length);
  protected readonly tightest = computed(() => this.queue()[0]);
  protected readonly nextInPool = computed(() =>
    [...TICKET_POOL].sort((a, b) => a.remaining - b.remaining).slice(0, 3)
  );
}
