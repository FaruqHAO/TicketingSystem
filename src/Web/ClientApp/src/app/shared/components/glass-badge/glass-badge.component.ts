import { Component, computed, input } from '@angular/core';

/**
 * Status pill. Tones are semantic, not decorative: `ok`/`warn`/`breach` mean SLA
 * health and nothing else, so a glance across a queue reads as time pressure.
 */
export type GlassBadgeTone = 'neutral' | 'cyan' | 'violet' | 'ok' | 'warn' | 'breach';

@Component({
  selector: 'glass-badge',
  template: `
    @if (dot()) {
      <span class="gbadge__dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styleUrl: './glass-badge.component.scss',
  host: { '[class]': 'classes()' }
})
export class GlassBadgeComponent {
  readonly tone = input<GlassBadgeTone>('neutral');
  readonly dot = input(true);
  /** Pulse the dot — for counts that are live, like an open queue. */
  readonly live = input(false);

  protected readonly classes = computed(() =>
    ['gbadge', `gbadge--${this.tone()}`, this.live() ? 'gbadge--live' : ''].filter(Boolean).join(' ')
  );
}
