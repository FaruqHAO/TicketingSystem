/**
 * The audit action names, in the order `Domain.Enums.AuthAuditAction` declares them —
 * the index *is* the value the API filters on, so the two lists must stay aligned.
 * The DTO returns the name as a string, which is what `humaniseAuditAction` reads.
 */
export const AUDIT_ACTIONS: readonly string[] = [
  'LoginSucceeded',
  'LoginFailed',
  'LoggedOut',
  'AccountLockedOut',
  'PasswordChanged',
  'UserCreated',
  'UserDeleted',
  'RoleAssigned',
  'RoleRemoved',
  'RolePermissionGranted',
  'RolePermissionRevoked'
];

/** `RolePermissionGranted` → `Role permission granted`. */
export function humaniseAuditAction(action: string | undefined): string {
  if (!action) {
    return 'Unknown';
  }
  const spaced = action.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0) + spaced.slice(1).toLowerCase();
}

/** Actions that mean something went wrong, for the tone of a row. */
export function isAuditFailure(entry: { action?: string; succeeded?: boolean }): boolean {
  return entry.succeeded === false || entry.action === 'AccountLockedOut';
}
