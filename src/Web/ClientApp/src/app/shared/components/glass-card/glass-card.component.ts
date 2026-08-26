import { Component, computed, input } from '@angular/core';

/**
 * Glass panel. The workhorse surface — every dashboard region is one of these.
 *
 *   <glass-card eyebrow="QUEUE" heading="Unassigned">
 *     <button glassBtn size="sm" cardAction>Refresh</button>
 *     …body…
 *     <div cardFoot>…</div>
 *   </glass-card>
 *
 * `interactive` opts into the hover lift, and should only be set when the whole
 * card is a link or button — a card that lifts but does nothing is a lie.
 */
@Component({
  selector: 'glass-card',
  templateUrl: './glass-card.component.html',
  styleUrl: './glass-card.component.scss',
  host: { '[class]': 'classes()' }
})
export class GlassCardComponent {
  /** Small-caps kicker naming the region. */
  readonly eyebrow = input<string>();
  readonly heading = input<string>();
  /** One line under the heading. */
  readonly sub = input<string>();
  /** Adds the hover lift. Only for cards that are themselves clickable. */
  readonly interactive = input(false);
  /** Recessed variant, for a card nested inside another panel. */
  readonly sunk = input(false);
  /** Specular highlight on the top edge. Off for small or dense cards. */
  readonly sheen = input(true);
  /** Drop the inner padding when the body manages its own (tables, lists). */
  readonly flush = input(false);

  protected readonly classes = computed(() =>
    [
      'gcard',
      this.sunk() ? 'glass-sunk' : 'glass',
      this.sheen() && !this.sunk() ? 'glass-sheen' : '',
      this.interactive() ? 'glass-lift' : '',
      this.flush() ? 'gcard--flush' : ''
    ]
      .filter(Boolean)
      .join(' ')
  );

  protected readonly hasHead = computed(() => !!(this.eyebrow() || this.heading() || this.sub()));
}
