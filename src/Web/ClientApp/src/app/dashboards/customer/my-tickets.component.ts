import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { NewRequestModalComponent } from '../../shared/components/new-request-modal/new-request-modal.component';
import { TicketTableComponent } from '../../shared/components/ticket-table/ticket-table.component';
import { CUSTOMER_NAV } from '../../shared/data/dashboard-nav';
import { MY_TICKETS, TicketStatus } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

type Filter = 'Open' | 'Resolved' | 'All';

/** Every request this customer has raised, filtered by whether it is still moving. */
@Component({
  selector: 'app-my-tickets',
  imports: [
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassButtonComponent,
    TicketTableComponent,
    NewRequestModalComponent
  ],
  templateUrl: './my-tickets.component.html'
})
export class MyTicketsComponent {
  protected readonly nav = CUSTOMER_NAV;
  protected readonly newRequest = signal(false);
  protected readonly filters: readonly Filter[] = ['Open', 'Resolved', 'All'];
  protected readonly filter = signal<Filter>('Open');

  protected readonly tickets = computed(() => {
    const closed: TicketStatus = 'Resolved';
    switch (this.filter()) {
      case 'Open':
        return MY_TICKETS.filter(t => t.status !== closed);
      case 'Resolved':
        return MY_TICKETS.filter(t => t.status === closed);
      default:
        return MY_TICKETS;
    }
  });

  protected readonly emptyMessage = computed(() =>
    this.filter() === 'Resolved' ? 'Nothing resolved yet.' : 'No open requests. Raise one when you need us.'
  );
}
