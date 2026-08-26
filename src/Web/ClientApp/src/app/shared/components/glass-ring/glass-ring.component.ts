import { Component, computed, input } from '@angular/core';

/**
 * SLA countdown ring.
 *
 * `remaining` is the fraction of the SLA window still available (1 = fresh,
 * 0 = breached), which is why the arc shrinks rather than fills — it is time you
 * have left, not work you have done. Colour follows the same reading, so a wall
 * of these is scannable without labels.
 */
@Component({
  selector: 'glass-ring',
  template: `
    <svg [attr.viewBox]="viewBox()" [style.width.px]="size()" [style.height.px]="size()" aria-hidden="true">
      <circle class="gring__track" [attr.cx]="c()" [attr.cy]="c()" [attr.r]="r()" [attr.stroke-width]="stroke()" />
      <circle
        class="gring__arc"
        [attr.cx]="c()"
        [attr.cy]="c()"
        [attr.r]="r()"
        [attr.stroke-width]="stroke()"
        [attr.stroke-dasharray]="circumference()"
        [attr.stroke-dashoffset]="offset()"
      />
    </svg>
    <div class="gring__inner">
      <p class="gring__value data">{{ label() }}</p>
      @if (caption()) {
        <p class="gring__caption">{{ caption() }}</p>
      }
    </div>
  `,
  styleUrl: './glass-ring.component.scss',
  host: {
    '[class]': '"gring gring--" + tone()',
    '[style.--gring-size.px]': 'size()',
    role: 'img',
    '[attr.aria-label]': 'ariaLabel()'
  }
})
export class GlassRingComponent {
  /** Fraction of the SLA window still available, 0–1. */
  readonly remaining = input(1);
  /** The figure in the middle — a duration, not a percentage. */
  readonly label = input.required<string>();
  /** What the clock is counting down to. */
  readonly caption = input<string>();
  readonly size = input(120);
  readonly stroke = input(6);

  protected readonly c = computed(() => this.size() / 2);
  protected readonly r = computed(() => this.size() / 2 - this.stroke());
  protected readonly viewBox = computed(() => `0 0 ${this.size()} ${this.size()}`);
  protected readonly circumference = computed(() => 2 * Math.PI * this.r());

  private readonly clamped = computed(() => Math.min(1, Math.max(0, this.remaining())));

  protected readonly offset = computed(() => this.circumference() * (1 - this.clamped()));

  /** Thresholds match the badge tones: comfortable, tightening, gone. */
  protected readonly tone = computed(() => {
    const left = this.clamped();
    if (left <= 0.001) {
      return 'breach';
    }
    return left > 0.5 ? 'ok' : left > 0.2 ? 'warn' : 'breach';
  });

  protected readonly ariaLabel = computed(
    () => `${this.label()} ${this.caption() ?? 'remaining'} — ${Math.round(this.clamped() * 100)}% of the SLA window left`
  );
}
