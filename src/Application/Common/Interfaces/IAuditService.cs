using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Common.Interfaces;

/// <summary>
/// Records security-relevant events to a persisted audit trail. Implemented in Infrastructure.
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Persists an audit record for <paramref name="action"/>. The actor and request metadata
    /// (IP, user agent) are resolved by the implementation from the ambient request context.
    /// </summary>
    Task RecordAsync(
        AuthAuditAction action,
        bool succeeded,
        string? targetUserId = null,
        string? targetUserName = null,
        string? roleOrPermission = null,
        string? details = null,
        CancellationToken cancellationToken = default);
}
