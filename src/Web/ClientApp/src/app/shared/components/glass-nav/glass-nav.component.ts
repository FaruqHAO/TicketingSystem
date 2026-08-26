import { Component, HostListener, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { NavItem } from '../../models/nav-item';

/**
 * Public top navigation. Sits over the mesh field and condenses once the page has
 * scrolled, so the hero reads edge-to-edge on arrival but the bar stays legible
 * over content afterwards.
 *
 * Actions (sign in, sign up) are projected rather than configured, because their
 * markup differs per page — a route link on the landing page, a form submit inside
 * the auth pages.
 */
@Component({
  selector: 'glass-nav',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './glass-nav.component.html',
  styleUrl: './glass-nav.component.scss'
})
export class GlassNavComponent {
  readonly brand = input('TicketingSystem');
  readonly links = input<readonly NavItem[]>([]);

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  @HostListener('document:scroll')
  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 12);
  }

  protected toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
