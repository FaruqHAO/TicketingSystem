namespace TicketingSystem.Domain.Entities;

/// <summary>
/// An append-only record of a security-relevant event (login, logout, lockout, role/permission
/// change, etc.).
/// <para>
/// Deliberately does <b>not</b> inherit <see cref="Common.BaseAuditableEntity"/>: this entity carries
/// its own actor and timestamp captured at the moment of the event, and must not be stamped by the
/// <c>AuditableEntityInterceptor</c>. It uses a <see cref="long"/> key to accommodate high volume.
/// </para>
/// </summary>
public class AuditTrail
{
    public long Id { get; set; }

    public DateTimeOffset Timestamp { get; set; }

    public AuthAuditAction Action { get; set; }

    public bool Succeeded { get; set; }

    /// <summary>The user who performed the action (null for anonymous/failed logins).</summary>
    public string? ActorUserId { get; set; }

    public string? ActorUserName { get; set; }

    /// <summary>The user the action was performed against, when different from the actor.</summary>
    public string? TargetUserId { get; set; }

    public string? TargetUserName { get; set; }

    /// <summary>The role or permission involved, for role/permission change actions.</summary>
    public string? RoleOrPermission { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    /// <summary>Optional free-text context (e.g. a failure reason).</summary>
    public string? Details { get; set; }
}
