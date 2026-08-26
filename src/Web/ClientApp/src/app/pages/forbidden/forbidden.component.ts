import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../api-authorization/auth.service';
import { GlassButtonComponent } from '../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { RolePermissionService } from '../../shared/services/role-permission.service';

/**
 * Shown when a signed-in user reaches a page their role has no key for. It says which
 * page and which role, because the usual next step is asking an administrator for the
 * right role — and that request needs both facts.
 */
@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, LucideAngularModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class ForbiddenComponent {
  private readonly auth = inject(AuthService);
  private readonly permissions = inject(RolePermissionService);
  private readonly route = inject(ActivatedRoute);

  protected readonly attempted = this.route.snapshot.queryParamMap.get('from');
  protected readonly dashboardRoute = computed(() => this.permissions.homeRoute());
  protected readonly roles = computed(() => this.auth.roles().join(', ') || 'none yet');
}
