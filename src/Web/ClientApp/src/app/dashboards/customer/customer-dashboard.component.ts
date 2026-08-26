import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { NewRequestModalComponent } from '../../shared/components/new-request-modal/new-request-modal.component';
import { TicketTableComponent } from '../../shared/components/ticket-table/ticket-table.component';
import { CUSTOMER_NAV } from '../../shared/data/dashboard-nav';
import { MY_TICKETS } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

/** The customer's landing page: what's open, what we promised, and a way to ask. */
@Component({
  selector: 'app-customer-dashboard',
  imports: [
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassButtonComponent,
    TicketTableComponent,
    NewRequestModalComponent
  ],
  templateUrl: './customer-dashboard.component.html'
})
export class CustomerDashboardComponent {
  protected readonly nav = CUSTOMER_NAV;
  protected readonly newRequest = signal(false);

  protected readonly openTickets = computed(() => MY_TICKETS.filter(t => t.status !== 'Resolved'));
  protected readonly waitingOnYou = computed(
    () => MY_TICKETS.filter(t => t.status === 'Waiting on customer').length
  );

  protected onSubmitted(draft: { subject: string }): void {
    // No endpoint to post to yet. Kept as a seam so the wiring is a one-line change.
    console.info('Draft request captured:', draft.subject);
  }
}
