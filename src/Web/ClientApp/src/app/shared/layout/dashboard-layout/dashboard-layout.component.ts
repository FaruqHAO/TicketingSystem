import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../../api-authorization/auth.service';
import { GlassButtonComponent } from '../../components/glass-button/glass-button.component';
import { GlassSidebarComponent } from '../../components/glass-sidebar/glass-sidebar.component';
import { NavSection } from '../../models/nav-item';
import { RolePermissionService } from '../../services/role-permission.service';

/**
 * The shell every dashboard sits in: glass rail, glass topbar, content well.
 *
 * Dashboards hand it their full nav and it removes the rows the viewer has no key
 * for, so one component serves every role and the filtering rule lives in one place.
 */
@Component({
  selector: 'dashboard-layout',
  imports: [GlassSidebarComponent, GlassButtonComponent, LucideAngularModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(RolePermissionService);
  private readonly router = inject(Router);

  /** Page heading. Names what the person is looking at. */
  readonly heading = input.required<string>();
  /** Small line above the heading — usually the section this page belongs to. */
  readonly eyebrow = input<string>();
  /** Full nav for this dashboard, before permission filtering. */
  readonly sections = input<readonly NavSection[]>([]);
  /** Role label shown under the wordmark, e.g. 'Agent desk'. */
  readonly context = input<string>();

  protected readonly navOpen = signal(false);
  protected readonly visibleSections = computed(() => this.permissions.filterNav(this.sections()));
  protected readonly email = computed(() => this.auth.email() ?? 'Signed in');
  protected readonly roleLabel = computed(() => this.auth.roles().join(' · ') || 'No role');

  /** Initials from the local part of the address — the only name we hold. */
  protected readonly initials = computed(() => {
    const local = (this.auth.email() ?? '?').split('@')[0];
    const parts = local.split(/[.\-_+]/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : local.slice(0, 2);
    return letters.toUpperCase();
  });

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/']),
      error: () => void this.router.navigate(['/'])
    });
  }
}
