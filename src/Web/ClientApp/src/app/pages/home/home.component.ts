import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../api-authorization/auth.service';
import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassNavComponent } from '../../shared/components/glass-nav/glass-nav.component';
import { GlassRingComponent } from '../../shared/components/glass-ring/glass-ring.component';
import { RolePermissionService } from '../../shared/services/role-permission.service';

/** One card in the hero stack. Illustrative: the ticket domain is not built yet. */
interface StackTicket {
  ref: string;
  subject: string;
  requester: string;
  priority: string;
  tone: 'breach' | 'warn' | 'cyan';
  /** Fraction of the SLA window still available. */
  remaining: number;
  /** Time left, as the ring shows it. */
  clock: string;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    LucideAngularModule,
    GlassNavComponent,
    GlassButtonComponent,
    GlassCardComponent,
    GlassBadgeComponent,
    GlassRingComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(RolePermissionService);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly dashboardRoute = computed(() => this.permissions.homeRoute());

  /**
   * The hero stack. Deliberately mid-flight rather than all-green: a support desk
   * that never shows a clock running down is not showing you the job.
   */
  protected readonly stack: readonly StackTicket[] = [
    {
      ref: 'TS-4118',
      subject: 'Card payments failing at checkout',
      requester: 'Nadia Osei',
      priority: 'Urgent',
      tone: 'breach',
      remaining: 0.14,
      clock: '34m'
    },
    {
      ref: 'TS-4117',
      subject: 'Export stops at 500 rows',
      requester: 'Tom Baird',
      priority: 'High',
      tone: 'warn',
      remaining: 0.42,
      clock: '3h'
    },
    {
      ref: 'TS-4115',
      subject: 'Add a second billing contact',
      requester: 'Priya Raman',
      priority: 'Normal',
      tone: 'cyan',
      remaining: 0.78,
      clock: '2d'
    }
  ];

  protected readonly desks = [
    {
      icon: 'life-buoy',
      name: 'Customers',
      blurb: 'Raise a request and follow it. You see every reply and the time we promised.',
      does: ['My tickets', 'New request']
    },
    {
      icon: 'headset',
      name: 'Agents',
      blurb: 'Work the tickets assigned to you, or claim the next one waiting in the pool.',
      does: ['Assigned queue', 'Ticket pool']
    },
    {
      icon: 'chart-line',
      name: 'Managers',
      blurb: 'Read SLA attainment, first-response time, and where the desk is slipping.',
      does: ['Analytics', 'SLA & reports']
    },
    {
      icon: 'shield-check',
      name: 'Administrators',
      blurb: 'Hold every key: people, roles, permissions, and the record of who did what.',
      does: ['Users & roles', 'Audit trail']
    }
  ];

  protected readonly foundations = [
    {
      icon: 'key-round',
      title: 'Permission-based access',
      body: 'Roles carry granular permissions, checked on the server for every request.'
    },
    {
      icon: 'timer',
      title: 'A clock on every ticket',
      body: 'Response and resolve targets are visible to the customer, not just the desk.'
    },
    {
      icon: 'scroll-text',
      title: 'A complete audit trail',
      body: 'Sign-ins, lockouts and permission changes are all written down, append-only.'
    }
  ];
}
