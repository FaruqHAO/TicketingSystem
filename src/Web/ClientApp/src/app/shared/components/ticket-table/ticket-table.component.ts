import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { DemoTicket } from '../../data/demo-tickets';
import { GlassBadgeComponent, GlassBadgeTone } from '../glass-badge/glass-badge.component';
import { GlassButtonComponent } from '../glass-button/glass-button.component';

/**
 * The queue, as a table. Used by every list of tickets so a row means the same thing
 * on the customer, agent and admin desks.
 *
 * SLA is a badge rather than a ring here: at row scale the colour is the whole signal,
 * and forty rings would fight the page.
 */
@Component({
  selector: 'ticket-table',
  imports: [LucideAngularModule, GlassBadgeComponent, GlassButtonComponent],
  templateUrl: './ticket-table.component.html',
  styleUrl: './ticket-table.component.scss'
})
export class TicketTableComponent {
  readonly tickets = input<readonly DemoTicket[]>([]);
  /** Who raised it. Off on a customer's own list, where the answer is always "you". */
  readonly showRequester = input(true);
  /** Who owns it. Off on a pool, where nobody does yet. */
  readonly showAssignee = input(false);
  /** Setting this adds a per-row button, e.g. 'Claim' on the pool. */
  readonly actionLabel = input<string>();
  readonly actionIcon = input('plus');
  /** What to say when there is nothing to show. Empty is an invitation, not a shrug. */
  readonly emptyMessage = input('Nothing here yet.');

  readonly action = output<DemoTicket>();

  /** SLA colour by time left, matching the ring's thresholds. */
  protected slaTone(ticket: DemoTicket): GlassBadgeTone {
    if (ticket.status === 'Resolved') {
      return 'neutral';
    }
    return ticket.remaining > 0.5 ? 'ok' : ticket.remaining > 0.2 ? 'warn' : 'breach';
  }

  protected priorityTone(ticket: DemoTicket): GlassBadgeTone {
    switch (ticket.priority) {
      case 'Urgent':
        return 'breach';
      case 'High':
        return 'warn';
      case 'Normal':
        return 'cyan';
      default:
        return 'neutral';
    }
  }
}
