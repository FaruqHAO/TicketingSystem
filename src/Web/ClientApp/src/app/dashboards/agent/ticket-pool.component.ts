import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { TicketTableComponent } from '../../shared/components/ticket-table/ticket-table.component';
import { AGENT_NAV } from '../../shared/data/dashboard-nav';
import { DemoTicket, TICKET_POOL } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

/**
 * Unclaimed work. Claiming is local for now — there is no assignment endpoint — but
 * the row leaves the pool so the interaction reads truthfully.
 */
@Component({
  selector: 'app-ticket-pool',
  imports: [
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassBadgeComponent,
    TicketTableComponent
  ],
  templateUrl: './ticket-pool.component.html',
  styleUrl: './ticket-pool.component.scss'
})
export class TicketPoolComponent {
  protected readonly nav = AGENT_NAV;

  protected readonly pool = signal<readonly DemoTicket[]>(
    [...TICKET_POOL].sort((a, b) => a.remaining - b.remaining)
  );
  protected readonly claimed = signal<readonly string[]>([]);

  protected readonly urgent = computed(() => this.pool().filter(t => t.remaining <= 0.25).length);

  protected claim(ticket: DemoTicket): void {
    this.pool.update(list => list.filter(t => t.ref !== ticket.ref));
    this.claimed.update(list => [ticket.ref, ...list]);
  }
}
