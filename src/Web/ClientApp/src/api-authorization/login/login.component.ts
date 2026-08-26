import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';
import { GlassButtonComponent } from '../../app/shared/components/glass-button/glass-button.component';
import { AuthShellComponent } from '../../app/shared/layout/auth-shell/auth-shell.component';

/** Where a visitor lands when they sign in without having asked for a page first. */
const DEFAULT_LANDING = '/dashboard';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, LucideAngularModule, AuthShellComponent, GlassButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  invalid = false;
  busy = false;

  async login() {
    if (this.busy) {
      return;
    }
    this.invalid = false;
    this.busy = true;
    try {
      await firstValueFrom(this.authService.login(this.email, this.password));
      // `/dashboard` resolves to whichever desk the role owns, so this component never
      // has to know the roles.
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || DEFAULT_LANDING;
      await this.router.navigateByUrl(returnUrl);
    } catch {
      // Only on failure: the success path navigates away, and refreshing a view that
      // is already gone throws.
      this.invalid = true;
      this.busy = false;
      this.cdr.detectChanges();
    }
  }
}
