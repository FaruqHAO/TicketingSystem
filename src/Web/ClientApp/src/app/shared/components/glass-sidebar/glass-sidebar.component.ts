import { Component, input, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { NavSection } from '../../models/nav-item';
import { GlassBadgeComponent } from '../glass-badge/glass-badge.component';

/**
 * Dashboard sidebar. Presentational on purpose — it renders whatever sections it
 * is handed and never decides who may see what. DashboardLayout filters by
 * permission before passing them in, so authorization lives in exactly one place.
 *
 * On narrow viewports it becomes an off-canvas drawer driven by the `open` model.
 */
@Component({
  selector: 'glass-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, GlassBadgeComponent],
  templateUrl: './glass-sidebar.component.html',
  styleUrl: './glass-sidebar.component.scss',
  host: { '[class.is-open]': 'open()' }
})
export class GlassSidebarComponent {
  readonly brand = input('TicketingSystem');
  /** Line under the wordmark — the viewer's role, so the shell says where you are. */
  readonly context = input<string>();
  readonly sections = input<readonly NavSection[]>([]);
  /** Drawer state. Ignored above the mobile breakpoint, where the rail is static. */
  readonly open = model(false);

  protected close(): void {
    this.open.set(false);
  }
}
