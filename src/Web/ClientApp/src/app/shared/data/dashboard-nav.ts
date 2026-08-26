import { NavSection } from '../models/nav-item';

/**
 * Navigation per role, defined once so every page in a role's shell shows the same
 * rail. Each entry carries the UI permission key its route demands, and
 * DashboardLayout drops the ones the viewer has no key for — so these lists are the
 * full menu, not the visible one.
 */

export const CUSTOMER_NAV: readonly NavSection[] = [
  {
    items: [
      {
        path: '/dashboard/customer',
        label: 'Overview',
        icon: 'layout-dashboard',
        permission: 'customer-dashboard',
        exact: true
      },
      { path: '/dashboard/customer/tickets', label: 'My tickets', icon: 'ticket', permission: 'my-tickets', badge: 3 }
    ]
  }
];

export const AGENT_NAV: readonly NavSection[] = [
  {
    items: [
      {
        path: '/dashboard/agent',
        label: 'Assigned to me',
        icon: 'layout-dashboard',
        permission: 'agent-dashboard',
        exact: true
      },
      { path: '/dashboard/agent/pool', label: 'Ticket pool', icon: 'inbox', permission: 'ticket-pool', badge: 5 }
    ]
  }
];

export const MANAGER_NAV: readonly NavSection[] = [
  {
    items: [
      {
        path: '/dashboard/manager',
        label: 'Desk overview',
        icon: 'layout-dashboard',
        permission: 'manager-dashboard',
        exact: true
      },
      { path: '/dashboard/manager/analytics', label: 'Analytics', icon: 'chart-line', permission: 'analytics' }
    ]
  }
];

/**
 * The administrator rail lists every page in the product, including the other roles'.
 * Nothing here is special-cased — `Administrator: ['*']` satisfies each key, which is
 * the wildcard doing its job in the one place you can see it.
 */
export const ADMIN_NAV: readonly NavSection[] = [
  {
    items: [
      {
        path: '/dashboard/admin',
        label: 'Desk overview',
        icon: 'layout-dashboard',
        permission: 'admin-dashboard',
        exact: true
      }
    ]
  },
  {
    title: 'Administration',
    items: [
      { path: '/dashboard/admin/people', label: 'People & roles', icon: 'users', permission: 'user-management' },
      { path: '/dashboard/admin/audit', label: 'Audit trail', icon: 'scroll-text', permission: 'audit-log' }
    ]
  },
  {
    title: 'Every desk',
    items: [
      { path: '/dashboard/customer', label: 'Customer view', icon: 'life-buoy', permission: 'customer-dashboard', exact: true },
      { path: '/dashboard/customer/tickets', label: 'My tickets', icon: 'ticket', permission: 'my-tickets' },
      { path: '/dashboard/agent', label: 'Agent view', icon: 'headset', permission: 'agent-dashboard', exact: true },
      { path: '/dashboard/agent/pool', label: 'Ticket pool', icon: 'inbox', permission: 'ticket-pool' },
      { path: '/dashboard/manager', label: 'Manager view', icon: 'gauge', permission: 'manager-dashboard', exact: true },
      { path: '/dashboard/manager/analytics', label: 'Analytics', icon: 'chart-line', permission: 'analytics' }
    ]
  }
];
