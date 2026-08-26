import { Component, computed, model, output, signal } from '@angular/core';

import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { GlassModalComponent } from '../glass-modal/glass-modal.component';

/**
 * The customer's "raise a request" form, in a glass modal.
 *
 * Nothing is persisted yet — there is no Ticket endpoint to post to — so submitting
 * closes the dialog and reports the draft upward. The note in the footer says so
 * rather than pretending the request was filed.
 */
@Component({
  selector: 'new-request-modal',
  imports: [GlassModalComponent, GlassButtonComponent],
  templateUrl: './new-request-modal.component.html',
  styleUrl: './new-request-modal.component.scss'
})
export class NewRequestModalComponent {
  readonly open = model(false);
  readonly submitted = output<{ subject: string; category: string; priority: string }>();

  protected readonly subject = signal('');
  protected readonly category = signal('Billing');
  protected readonly priority = signal('Normal');
  protected readonly canSend = computed(() => this.subject().trim().length > 3);

  protected readonly categories = ['Billing', 'Platform', 'Onboarding', 'Integrations'];
  protected readonly priorities = ['Low', 'Normal', 'High', 'Urgent'];

  protected send(): void {
    if (!this.canSend()) {
      return;
    }
    this.submitted.emit({
      subject: this.subject().trim(),
      category: this.category(),
      priority: this.priority()
    });
    this.reset();
  }

  protected cancel(): void {
    this.reset();
  }

  private reset(): void {
    this.subject.set('');
    this.open.set(false);
  }
}
