import { Component, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GlassBadgeComponent } from '../../shared/components/glass-badge/glass-badge.component';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card.component';
import { GlassStatComponent } from '../../shared/components/glass-stat/glass-stat.component';
import { MANAGER_NAV } from '../../shared/data/dashboard-nav';
import { DESK_AGENTS, DESK_METRICS, QUEUE_LOAD, WEEKLY_VOLUME } from '../../shared/data/demo-tickets';
import { DashboardLayoutComponent } from '../../shared/layout/dashboard-layout/dashboard-layout.component';

/**
 * The deeper read behind the overview: volume against capacity, and who is carrying it.
 * Guarded by its own `analytics` permission, which is why it is a route rather than a
 * panel on the overview.
 */
@Component({
  selector: 'app-analytics',
  imports: [
    LucideAngularModule,
    DashboardLayoutComponent,
    GlassCardComponent,
    GlassStatComponent,
    GlassBadgeComponent
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  protected readonly nav = MANAGER_NAV;
  protected readonly days = WEEKLY_VOLUME;
  protected readonly agents = DESK_AGENTS;
  protected readonly metrics = DESK_METRICS;

  protected readonly opened = computed(() => this.days.reduce((sum, d) => sum + d.opened, 0));
  protected readonly resolved = computed(() => this.days.reduce((sum, d) => sum + d.resolved, 0));

  /** Positive means the backlog grew: more came in than went out. */
  protected readonly net = computed(() => this.opened() - this.resolved());

  protected readonly busiestDay = computed(() =>
    this.days.reduce((worst, d) => (d.opened > worst.opened ? d : worst))
  );

  protected readonly openAcrossQueues = computed(() => QUEUE_LOAD.reduce((sum, q) => sum + q.open, 0));

  /** Bars share one scale across both series, or the comparison would be meaningless. */
  private readonly peak = computed(() => Math.max(...this.days.flatMap(d => [d.opened, d.resolved])));

  protected readonly chartSummary = computed(
    () =>
      `Opened against resolved, Monday to Sunday. ${this.opened()} opened, ${this.resolved()} resolved, ` +
      `busiest day ${this.busiestDay().day} with ${this.busiestDay().opened} opened.`
  );

  protected height(value: number): number {
    return (value / this.peak()) * 100;
  }

  protected agentTone(status: string): 'ok' | 'warn' | 'neutral' {
    return status === 'Available' ? 'ok' : status === 'Busy' ? 'warn' : 'neutral';
  }
}
