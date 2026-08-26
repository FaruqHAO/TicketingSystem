/**
 * Illustrative data for the dashboards.
 *
 * The ticket domain does not exist on the server yet — there is no Ticket entity, no
 * endpoints, no SLA engine. These rows exist so the shell, the role guards and the
 * glass kit can be reviewed against realistic shapes. Swap each array for a query
 * against the real API as the domain lands; the components read only the interfaces
 * below, so nothing else has to change.
 */

export type TicketStatus = 'New' | 'Triaged' | 'In progress' | 'Waiting on customer' | 'Resolved';

export interface DemoTicket {
  ref: string;
  subject: string;
  requester: string;
  assignee?: string;
  status: TicketStatus;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  /** Fraction of the SLA window still available, 0–1. */
  remaining: number;
  /** Time left, pre-formatted. */
  clock: string;
  updated: string;
}

/** What a customer sees: their own requests, newest first. */
export const MY_TICKETS: readonly DemoTicket[] = [
  {
    ref: 'TS-4118',
    subject: 'Card payments failing at checkout',
    requester: 'You',
    assignee: 'Dee Whitmore',
    status: 'In progress',
    priority: 'Urgent',
    remaining: 0.14,
    clock: '34m',
    updated: '6 minutes ago'
  },
  {
    ref: 'TS-4102',
    subject: 'Invoice PDF shows last month’s address',
    requester: 'You',
    assignee: 'Sam Iyer',
    status: 'Waiting on customer',
    priority: 'Normal',
    remaining: 0.55,
    clock: '1d',
    updated: 'Yesterday'
  },
  {
    ref: 'TS-4077',
    subject: 'Add a second billing contact',
    requester: 'You',
    assignee: 'Dee Whitmore',
    status: 'Triaged',
    priority: 'Low',
    remaining: 0.82,
    clock: '3d',
    updated: '2 days ago'
  },
  {
    ref: 'TS-3990',
    subject: 'Password reset email never arrived',
    requester: 'You',
    assignee: 'Sam Iyer',
    status: 'Resolved',
    priority: 'High',
    remaining: 1,
    clock: 'met',
    updated: 'Last week'
  }
];

/** An agent's own queue. */
export const ASSIGNED_TICKETS: readonly DemoTicket[] = [
  {
    ref: 'TS-4118',
    subject: 'Card payments failing at checkout',
    requester: 'Nadia Osei',
    assignee: 'You',
    status: 'In progress',
    priority: 'Urgent',
    remaining: 0.14,
    clock: '34m',
    updated: '6 minutes ago'
  },
  {
    ref: 'TS-4111',
    subject: 'SSO login loops back to the sign-in page',
    requester: 'Marcus Feld',
    assignee: 'You',
    status: 'Triaged',
    priority: 'High',
    remaining: 0.31,
    clock: '2h',
    updated: '40 minutes ago'
  },
  {
    ref: 'TS-4098',
    subject: 'Bulk import rejects rows with accents',
    requester: 'Lena Vogt',
    assignee: 'You',
    status: 'Waiting on customer',
    priority: 'Normal',
    remaining: 0.61,
    clock: '1d',
    updated: '3 hours ago'
  },
  {
    ref: 'TS-4090',
    subject: 'Webhook retries stop after one attempt',
    requester: 'Ade Salami',
    assignee: 'You',
    status: 'In progress',
    priority: 'High',
    remaining: 0.22,
    clock: '1h',
    updated: '5 hours ago'
  }
];

/** Unclaimed work. Nobody owns these yet, which is the point of the pool. */
export const TICKET_POOL: readonly DemoTicket[] = [
  {
    ref: 'TS-4121',
    subject: 'Export stops at 500 rows',
    requester: 'Tom Baird',
    status: 'New',
    priority: 'High',
    remaining: 0.42,
    clock: '3h',
    updated: '2 minutes ago'
  },
  {
    ref: 'TS-4120',
    subject: 'Timezone on scheduled reports is an hour out',
    requester: 'Priya Raman',
    status: 'New',
    priority: 'Normal',
    remaining: 0.68,
    clock: '1d',
    updated: '18 minutes ago'
  },
  {
    ref: 'TS-4119',
    subject: 'Cannot remove a deactivated user from a team',
    requester: 'Joon-ho Park',
    status: 'New',
    priority: 'Normal',
    remaining: 0.74,
    clock: '1d',
    updated: '25 minutes ago'
  },
  {
    ref: 'TS-4116',
    subject: 'API returns 500 on empty search term',
    requester: 'Hana Kovac',
    status: 'Triaged',
    priority: 'Urgent',
    remaining: 0.08,
    clock: '12m',
    updated: '1 hour ago'
  },
  {
    ref: 'TS-4114',
    subject: 'Attachment preview blank for .heic images',
    requester: 'Owen Pryce',
    status: 'New',
    priority: 'Low',
    remaining: 0.91,
    clock: '4d',
    updated: '2 hours ago'
  }
];

/** Manager numbers. Weekly window, which is what the SLA policy is written against. */
export const DESK_METRICS = {
  slaAttainment: 94.2,
  slaTarget: 95,
  firstResponse: '11m',
  firstResponseDelta: -18,
  resolveTime: '5h 12m',
  resolveDelta: -6,
  backlog: 37,
  backlogDelta: 9,
  reopened: 4,
  reopenedDelta: -25
};

/** Volume by day, Monday first. Drives the bar strip on the manager dashboard. */
export const WEEKLY_VOLUME: readonly { day: string; opened: number; resolved: number }[] = [
  { day: 'Mon', opened: 41, resolved: 38 },
  { day: 'Tue', opened: 52, resolved: 47 },
  { day: 'Wed', opened: 48, resolved: 51 },
  { day: 'Thu', opened: 61, resolved: 55 },
  { day: 'Fri', opened: 57, resolved: 62 },
  { day: 'Sat', opened: 18, resolved: 21 },
  { day: 'Sun', opened: 12, resolved: 14 }
];

export interface QueueLoad {
  queue: string;
  open: number;
  atRisk: number;
  breached: number;
}

export const QUEUE_LOAD: readonly QueueLoad[] = [
  { queue: 'Billing', open: 14, atRisk: 3, breached: 1 },
  { queue: 'Platform', open: 11, atRisk: 4, breached: 0 },
  { queue: 'Onboarding', open: 7, atRisk: 1, breached: 0 },
  { queue: 'Integrations', open: 5, atRisk: 2, breached: 2 }
];

export interface DemoAgent {
  name: string;
  role: string;
  open: number;
  resolvedThisWeek: number;
  status: 'Available' | 'Busy' | 'Away';
}

export const DESK_AGENTS: readonly DemoAgent[] = [
  { name: 'Dee Whitmore', role: 'Agent', open: 9, resolvedThisWeek: 31, status: 'Busy' },
  { name: 'Sam Iyer', role: 'Agent', open: 6, resolvedThisWeek: 27, status: 'Available' },
  { name: 'Rae Nkemelu', role: 'Agent', open: 4, resolvedThisWeek: 22, status: 'Available' },
  { name: 'Kit Lassiter', role: 'Manager', open: 1, resolvedThisWeek: 8, status: 'Away' }
];
