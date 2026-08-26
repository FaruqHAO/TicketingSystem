import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The frame both auth pages sit in: the wordmark, one glass pane, and a line of small
 * print underneath. Declared once so signing in and signing up cannot drift apart.
 *
 * Content aimed at `[authFoot]` must be a single root node in whichever block it sits
 * in, or Angular will not route it into the slot.
 */
@Component({
  selector: 'auth-shell',
  imports: [RouterLink],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss'
})
export class AuthShellComponent {
  readonly eyebrow = input('');
  readonly heading = input.required<string>();
  readonly sub = input('');
}
