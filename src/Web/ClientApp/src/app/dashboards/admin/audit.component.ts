import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { AuditClient, AuditTrailDto } from '../../web-api-client';
import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { ADMIN_NAV } from '../../shared/data/dashboard-nav';
import { AUDIT_ACTIONS, humaniseAuditAction } from '../../shared/data/audit-actions';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

const PAGE_SIZE = 25;

/**
 * The security audit trail, straight from `GET /api/Audit`. Append-only on the server,
 * read-only here — an audit log you can edit is not one.
 */
@Component({
  selector: 'app-audit',
  imports: [
    DatePipe,
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassButtonComponent,
    GlassBadgeComponent
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {
  private readonly auditClient = inject(AuditClient);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly nav = ADMIN_NAV;
  protected readonly pageSize = PAGE_SIZE;

  /** The index into AUDIT_ACTIONS is the value the API filters on. */
  protected readonly options = AUDIT_ACTIONS.map((name, value) => ({ value, label: humaniseAuditAction(name) }));

  protected readonly page = signal(1);
  protected readonly action = signal<number | undefined>(undefined);
  protected readonly entries = signal<readonly AuditTrailDto[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly failures = computed(() => this.entries().filter(entry => entry.succeeded === false).length);
  protected readonly filtered = computed(() => this.action() !== undefined);

  constructor() {
    this.load();
  }

  protected setAction(raw: string): void {
    this.action.set(raw === '' ? undefined : Number(raw));
    this.page.set(1);
    this.load();
  }

  protected go(delta: number): void {
    this.page.update(current => Math.min(Math.max(1, current + delta), Math.max(1, this.totalPages())));
    this.load();
  }

  protected label(action: string | undefined): string {
    return humaniseAuditAction(action);
  }

  /** What the row is about: the target if there is one, otherwise the address it came from. */
  protected subject(entry: AuditTrailDto): string {
    const target = entry.targetUserName ?? entry.targetUserId;
    if (target && entry.roleOrPermission) {
      return `${target} → ${entry.roleOrPermission}`;
    }
    return target ?? entry.roleOrPermission ?? entry.ipAddress ?? '—';
  }

  private load(): void {
    this.loading.set(true);
    this.auditClient
      .getAuditTrail(this.page(), PAGE_SIZE, this.action(), undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.entries.set(result.items);
          this.total.set(result.totalCount ?? result.items.length);
          this.totalPages.set(result.totalPages ?? 1);
          this.failed.set(false);
          this.loading.set(false);
        },
        // Most likely a 403: the page opened on its UI key, but reading the trail needs
        // Permissions.Audit.View on the server. Say so rather than showing an empty table.
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        }
      });
  }
}
