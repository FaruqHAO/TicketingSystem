import { Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GlassButtonComponent } from '../glass-button/glass-button.component';

/**
 * Glass modal, built on the native `<dialog>` element.
 *
 *   <glass-modal [(open)]="composing" heading="New ticket">
 *     …form…
 *     <div modalFoot>…</div>
 *   </glass-modal>
 *
 * Native `<dialog>` is deliberate: it gives focus trapping, Escape-to-close, an
 * inert background and correct screen-reader semantics without us reimplementing
 * any of it. The `open` model stays in sync in both directions, so closing via
 * Escape or the backdrop reports back to the parent.
 */
@Component({
  selector: 'glass-modal',
  imports: [LucideAngularModule, GlassButtonComponent],
  templateUrl: './glass-modal.component.html',
  styleUrl: './glass-modal.component.scss'
})
export class GlassModalComponent {
  readonly open = model(false);
  readonly heading = input<string>();
  readonly sub = input<string>();
  /** Max width of the panel. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Clicking the backdrop dismisses. Turn off for forms with unsaved input. */
  readonly dismissOnBackdrop = input(true);

  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open()) {
        if (!el.open) {
          el.showModal();
        }
      } else if (el.open) {
        el.close();
      }
    });
  }

  /** Fired by the dialog's own close event, however it was triggered. */
  protected onClose(): void {
    this.open.set(false);
    this.closed.emit();
  }

  /**
   * The backdrop is part of the dialog element, so a click landing on the dialog
   * itself — rather than bubbling out of the panel inside it — is a backdrop click.
   */
  protected onDialogClick(event: MouseEvent): void {
    if (this.dismissOnBackdrop() && event.target === this.dialog().nativeElement) {
      this.open.set(false);
    }
  }
}
