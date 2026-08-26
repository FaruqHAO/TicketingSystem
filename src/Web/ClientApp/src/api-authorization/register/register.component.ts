import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';
import { GlassButtonComponent } from '../../app/shared/components/glass-button/glass-button.component';
import { AuthShellComponent } from '../../app/shared/layout/auth-shell/auth-shell.component';

/**
 * The server's password policy, stated once here and shown to the user as they type.
 * Mirrors `IdentityOptions.Password` in `src/Infrastructure/DependencyInjection.cs` —
 * if that changes, this list has to change with it, or the form will accept passwords
 * the API rejects.
 */
const PASSWORD_RULES: readonly { label: string; met: (value: string) => boolean }[] = [
  { label: '12 characters or more', met: value => value.length >= 12 },
  { label: 'An uppercase and a lowercase letter', met: value => /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value) },
  { label: 'A number', met: value => /\p{Nd}/u.test(value) },
  { label: 'A symbol', met: value => /[^\p{L}\p{N}]/u.test(value) },
  { label: '4 different characters', met: value => new Set(value).size >= 4 }
];

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, LucideAngularModule, AuthShellComponent, GlassButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  emailTouched = false;
  busy = false;
  done = false;
  /** Whatever the server objected to, in its own words. */
  errors: string[] = [];

  readonly rules = PASSWORD_RULES;

  get emailValid() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  get passwordValid() {
    return PASSWORD_RULES.every(rule => rule.met(this.password));
  }

  get canSubmit() {
    return this.emailValid && this.passwordValid && !this.busy;
  }

  met(rule: (typeof PASSWORD_RULES)[number]) {
    return rule.met(this.password);
  }

  async register() {
    this.emailTouched = true;
    this.errors = [];
    if (!this.canSubmit) {
      return;
    }

    this.busy = true;
    try {
      await firstValueFrom(this.authService.register(this.email, this.password));
      this.done = true;
    } catch (error) {
      this.errors = problemMessages(error);
    } finally {
      this.busy = false;
      this.cdr.detectChanges();
    }
  }
}

/**
 * Identity answers a rejected registration with a validation problem document keyed by
 * error code — `DuplicateUserName`, `PasswordTooShort`. The messages are already written
 * for a person to read, so show them rather than a generic apology.
 */
function problemMessages(error: unknown): string[] {
  const errors = (error as { errors?: Record<string, string[]> } | null)?.errors;
  const messages = errors ? Object.values(errors).flat().filter(Boolean) : [];
  return messages.length ? messages : ['That account could not be created. Please try again.'];
}
