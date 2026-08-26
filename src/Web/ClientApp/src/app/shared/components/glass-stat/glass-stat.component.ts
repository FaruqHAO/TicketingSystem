import { Component, computed, input } from '@angular/core';

/**
 * Metric tile. The figure is set in the data face and tabular-aligned so a row of
 * these lines up on the decimal rather than wobbling.
 *
 * `delta` is a signed change against the previous period. Whether up is good is
 * not universal — a rising backlog is bad, a rising resolve rate is good — so the
 * caller states it with `goodDirection`.
 */
@Component({
  selector: 'glass-stat',
  template: `
    <p class="gstat__label">{{ label() }}</p>
    <p class="gstat__figure data">
      {{ value() }}
      @if (unit()) {
        <span class="gstat__unit">{{ unit() }}</span>
      }
    </p>
    @if (delta() !== undefined) {
      <p class="gstat__delta data" [class]="deltaClass()">
        <span aria-hidden="true">{{ delta()! > 0 ? '↑' : delta()! < 0 ? '↓' : '→' }}</span>
        {{ deltaLabel() }}
        <span class="faint">{{ deltaNote() }}</span>
      </p>
    }
  `,
  styleUrl: './glass-stat.component.scss',
  host: { class: 'glass-sunk' }
})
export class GlassStatComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input<string>();
  /** Signed percentage change. Omit to hide the row entirely. */
  readonly delta = input<number>();
  /** Which direction counts as an improvement for this particular metric. */
  readonly goodDirection = input<'up' | 'down'>('up');
  /** What the delta is measured against, e.g. 'vs last week'. */
  readonly deltaNote = input('vs last week');

  protected readonly deltaLabel = computed(() => `${Math.abs(this.delta() ?? 0)}%`);

  protected readonly deltaClass = computed(() => {
    const d = this.delta() ?? 0;
    if (d === 0) {
      return 'gstat__delta--flat';
    }
    const improving = this.goodDirection() === 'up' ? d > 0 : d < 0;
    return improving ? 'gstat__delta--good' : 'gstat__delta--bad';
  });
}
