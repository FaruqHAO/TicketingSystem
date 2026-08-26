import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { RoleDetail, RolesClient } from '../../web-api-client';
import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { ADMIN_NAV } from '../../shared/data/dashboard-nav';
import { DESK_AGENTS } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

interface PermissionGroup {
  area: string;
  actions: string[];
}

interface RoleView {
  name: string;
  total: number;
  groups: PermissionGroup[];
}

/**
 * Roles are read live from `GET /api/Roles` — these are the real permission claims the
 * server enforces, not the UI keys in ROLE_PERMISSIONS. The people table below is still
 * illustrative: there is no endpoint that lists users yet.
 */
@Component({
  selector: 'app-people',
  imports: [
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassBadgeComponent
  ],
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss'
})
export class PeopleComponent {
  private readonly rolesClient = inject(RolesClient);

  protected readonly nav = ADMIN_NAV;

  private readonly roles = signal<readonly RoleDetail[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly search = signal('');

  protected readonly people = DESK_AGENTS;

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.people;
    }
    return this.people.filter(
      person => person.name.toLowerCase().includes(term) || person.role.toLowerCase().includes(term)
    );
  });

  /** Grouped by area so a role holding everything still reads as a list, not a wall. */
  protected readonly roleViews = computed<RoleView[]>(() =>
    this.roles().map(role => {
      const groups = new Map<string, string[]>();
      for (const permission of role.permissions) {
        const [area, action] = this.split(permission);
        groups.set(area, [...(groups.get(area) ?? []), action]);
      }
      return {
        name: role.name,
        total: role.permissions.length,
        groups: [...groups].map(([area, actions]) => ({ area, actions }))
      };
    })
  );

  protected readonly totalPermissions = computed(() =>
    this.roleViews().reduce((sum, role) => sum + role.total, 0)
  );

  constructor() {
    this.rolesClient
      .getRoles()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: roles => {
          this.roles.set(roles);
          this.loading.set(false);
        },
        // A 403 here means the account can open the page but lacks Permissions.Roles.View
        // on the server — worth showing plainly rather than as an empty table.
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        }
      });
  }

  protected email(name: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '.')}@acme.test`;
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .map(part => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  /** `Permissions.Tickets.Create` → `['Tickets', 'Create']`. */
  private split(permission: string): [string, string] {
    const parts = permission.replace(/^Permissions\./, '').split('.');
    return parts.length > 1 ? [parts[0], parts.slice(1).join('.')] : ['General', parts[0]];
  }
}
