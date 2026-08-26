import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthService } from '../../../api-authorization/auth.service';
import { NavItem, NavSection } from '../models/nav-item';

/** Grants every permission key, present and future. */
export const WILDCARD = '*';

/**
 * UI permission keys per role. These gate *pages*, not data — the server enforces the
 * real thing via its own permission claims. Adding a role here is the only change
 * needed to give it a dashboard; nothing in the guard or layout knows these names.
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Administrator: ['*'], // wildcard = all access
  Customer: ['customer-dashboard', 'my-tickets'],
  Agent: ['agent-dashboard', 'ticket-pool'],
  Manager: ['manager-dashboard', 'analytics']
};

/**
 * Where each role lands when it asks for `/dashboard`. Kept beside the permission map
 * so a new role is described in one place.
 */
export const ROLE_HOME: Record<string, string> = {
  Administrator: '/dashboard/admin',
  Customer: '/dashboard/customer',
  Agent: '/dashboard/agent',
  Manager: '/dashboard/manager'
};

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private readonly auth = inject(AuthService);

  /**
   * Signal-backed copy of the map so roles registered at runtime — by a feature module,
   * a plugin, or a config fetch — re-run every guard and nav filter that reads it.
   */
  private readonly grants = signal<Record<string, readonly string[]>>({ ...ROLE_PERMISSIONS });
  private readonly homes = signal<Record<string, string>>({ ...ROLE_HOME });

  /** Every key the current user holds. Contains `'*'` verbatim for wildcard roles. */
  readonly permissions = computed<ReadonlySet<string>>(() => {
    const map = this.grants();
    const held = new Set<string>();
    for (const role of this.auth.roles()) {
      for (const key of map[role] ?? []) {
        held.add(key);
      }
    }
    return held;
  });

  /** True when any of the user's roles is a super role. */
  readonly isSuperUser = computed(() => this.permissions().has(WILDCARD));

  /** The route this user should see when they ask for the dashboard generally. */
  readonly homeRoute = computed(() => {
    const map = this.homes();
    for (const role of this.auth.roles()) {
      if (map[role]) {
        return map[role];
      }
    }
    return '/';
  });

  /**
   * Teach the system about a role the app did not ship with. Later calls replace an
   * existing entry, which is how a server-supplied map can override the defaults.
   */
  register(role: string, permissions: readonly string[], home?: string): void {
    this.grants.update(map => ({ ...map, [role]: [...permissions] }));
    if (home) {
      this.homes.update(map => ({ ...map, [role]: home }));
    }
  }

  /** A route with no key is open to anybody who reached the shell. */
  can(permission?: string | null): boolean {
    if (!permission) {
      return true;
    }
    const held = this.permissions();
    return held.has(WILDCARD) || held.has(permission);
  }

  canAny(permissions: readonly string[]): boolean {
    return permissions.length === 0 || permissions.some(key => this.can(key));
  }

  /**
   * Drops nav entries the viewer cannot open, then drops sections left empty. The
   * sidebar renders whatever survives, so a Customer and an Administrator get the
   * same component with different rows.
   */
  filterNav(sections: readonly NavSection[]): NavSection[] {
    return sections
      .map(section => ({ ...section, items: section.items.filter((item: NavItem) => this.can(item.permission)) }))
      .filter(section => section.items.length > 0);
  }
}
