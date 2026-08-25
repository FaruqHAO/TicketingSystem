namespace TicketingSystem.Domain.Enums;

/// <summary>
/// The category of security-relevant action recorded in the <see cref="Entities.AuditTrail"/>.
/// </summary>
public enum AuthAuditAction
{
    LoginSucceeded = 0,
    LoginFailed = 1,
    LoggedOut = 2,
    AccountLockedOut = 3,
    PasswordChanged = 4,
    UserCreated = 5,
    UserDeleted = 6,
    RoleAssigned = 7,
    RoleRemoved = 8,
    RolePermissionGranted = 9,
    RolePermissionRevoked = 10
}
