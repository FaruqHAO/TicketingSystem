/**
 * A single entry in a glass nav or sidebar.
 *
 * `permission` is the UI permission key the viewer must hold for this entry to
 * render — see ROLE_PERMISSIONS in shared/services/role-permission.service.ts.
 * Entries without one are visible to anybody who can reach the shell.
 */
export interface NavItem {
  /** Router path, absolute (e.g. '/dashboard/agent/pool'). */
  path: string;
  /** Human label. Names what the person does, not how it is stored. */
  label: string;
  /** Lucide icon name, registered in AppModule. */
  icon: string;
  /** UI permission key required to see this entry. */
  permission?: string;
  /** Optional trailing count — open tickets, unread items. */
  badge?: number;
  /** Match the path exactly rather than by prefix. */
  exact?: boolean;
}

/** A grouped run of nav items, so a long sidebar stays readable. */
export interface NavSection {
  /** Section heading. Omit for the first, unlabelled group. */
  title?: string;
  items: NavItem[];
}
