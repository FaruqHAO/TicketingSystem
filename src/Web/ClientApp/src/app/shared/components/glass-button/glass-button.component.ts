import { Component, computed, input, ViewEncapsulation } from '@angular/core';

export type GlassButtonVariant = 'primary' | 'glass' | 'ghost' | 'danger';
export type GlassButtonSize = 'sm' | 'md' | 'lg';

/**
 * Glass button.
 *
 * Applied as an attribute to a real `<button>` or `<a>` rather than wrapping one,
 * so `type="submit"`, `routerLink`, `disabled` and keyboard semantics stay native:
 *
 *   <button glassBtn variant="primary" type="submit">Sign in</button>
 *   <a glassBtn variant="ghost" routerLink="/register">Create an account</a>
 *
 * `primary` is the one high-emphasis fill in the system — at most one per view.
 */
@Component({
  selector: 'button[glassBtn], a[glassBtn]',
  template: '<ng-content />',
  styleUrl: './glass-button.component.scss',
  // Styles target the host element itself, which carries consumer-supplied
  // attributes; encapsulation off keeps the selectors readable and shared.
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[attr.data-loading]': 'loading() || null'
  }
})
export class GlassButtonComponent {
  readonly variant = input<GlassButtonVariant>('glass');
  readonly size = input<GlassButtonSize>('md');
  /** Fill the available width — for stacked forms and mobile CTAs. */
  readonly block = input(false);
  /** Swaps the label for a spinner and blocks pointer events. */
  readonly loading = input(false);

  protected readonly classes = computed(() =>
    ['gbtn', `gbtn--${this.variant()}`, `gbtn--${this.size()}`, this.block() ? 'gbtn--block' : ''].join(' ').trim()
  );
}
