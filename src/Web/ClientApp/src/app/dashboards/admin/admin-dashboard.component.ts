import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuditClient, AuditTrailDto, RoleDetail, RolesClient } from '../../web-api-client';
import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { ADMIN_NAV } from '../../shared/data/dashboard-nav';
import { QUEUE_LOAD } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';
import { humaniseAuditAction } from '../../shared/data/audit-actions';
import { RolePermissionService, WILDCARD } from '../../shared/services/role-permission.service';

/**
 * The administrator's view is of the system rather than of tickets: who may do what,
 * and what has been done. Roles and the auth feed are read live from the API the auth
 * feature already ships — this is the one page in the product showing server state.
 *
 * The desk shortcuts at the bottom are the wildcard made visible: each names the
 * permission key its route demands, none of which is listed for Administrator.
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [
    DatePipe,
    RouterLink,
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassButtonComponent,
    GlassBadgeComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly rolesClient = inject(RolesClient);
  private readonly auditClient = inject(AuditClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissions = inject(RolePermissionService);

  protected readonly nav = ADMIN_NAV;
  protected readonly wildcard = WILDCARD;

  private readonly roles = signal<readonly RoleDetail[]>([]);
  protected readonly recent = signal<readonly AuditTrailDto[]>([]);
  protected readonly auditTotal = signal<number | null>(null);
  protected readonly rolesFailed = signal(false);
  protected readonly auditFailed = signal(false);

  /** Demo: there is no ticket domain on the server yet. */
  protected readonly openTickets = QUEUE_LOAD.reduce((sum, q) => sum + q.open, 0);

  protected readonly grantedTotal = computed(() =>
    this.roles().reduce((sum, role) => sum + role.permissions.length, 0)
  );

  /** Administrator holds every permission, so it sets the scale for the bars. */
  private readonly widest = computed(() => Math.max(1, ...this.roles().map(role => role.permissions.length)));

  protected readonly roleSummary = computed(() =>
    [...this.roles()]
      .sort((a, b) => b.permissions.length - a.permissions.length)
      .map(role => ({
        name: role.name,
        count: role.permissions.length,
        width: (role.permissions.length / this.widest()) * 100
      }))
  );

  /** True when the viewer holds `*` rather than the individual keys. */
  protected readonly isSuperUser = this.permissions.isSuperUser;

  protected readonly desks = [
    {
      label: 'Customer view',
      route: '/dashboard/customer',
      icon: 'life-buoy',
      permission: 'customer-dashboard',
      blurb: 'What a requester sees of their own tickets.'
    },
    {
      label: 'Agent view',
      route: '/dashboard/agent',
      icon: 'headset',
      permission: 'agent-dashboard',
      blurb: 'A queue ordered by time left, plus the shared pool.'
    },
    {
      label: 'Manager view',
      route: '/dashboard/manager',
      icon: 'gauge',
      permission: 'manager-dashboard',
      blurb: 'SLA attainment, load by queue, reports.'
    }
  ];

  constructor() {
    // Two independent reads: either can fail on its own permission without blanking
    // the other, so each panel carries its own state.
    this.rolesClient
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: roles => this.roles.set(roles),
        error: () => this.rolesFailed.set(true)
      });

    this.auditClient
      .getAuditTrail(1, 6, undefined, undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: page => {
          this.recent.set(page.items);
          this.auditTotal.set(page.totalCount ?? page.items.length);
        },
        error: () => this.auditFailed.set(true)
      });
  }

  protected label(action: string | undefined): string {
    return humaniseAuditAction(action);
  }

  protected who(entry: AuditTrailDto): string {
    return entry.actorUserName ?? entry.actorUserId ?? entry.ipAddress ?? 'anonymous';
  }
}
