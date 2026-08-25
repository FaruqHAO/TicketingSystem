using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Domain.Entities;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Infrastructure.Identity;

/// <summary>
/// Persists security-relevant events to the <see cref="AuditTrail"/> table. The actor is resolved
/// from <see cref="IUser"/> and the request metadata from <see cref="IRequestContext"/>, so callers
/// need only supply what is specific to the event.
/// </summary>
public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IRequestContext _requestContext;
    private readonly TimeProvider _timeProvider;

    public AuditService(
        IApplicationDbContext context,
        IUser user,
        IRequestContext requestContext,
        TimeProvider timeProvider)
    {
        _context = context;
        _user = user;
        _requestContext = requestContext;
        _timeProvider = timeProvider;
    }

    public async Task RecordAsync(
        AuthAuditAction action,
        bool succeeded,
        string? targetUserId = null,
        string? targetUserName = null,
        string? roleOrPermission = null,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        _context.AuditTrails.Add(new AuditTrail
        {
            Timestamp = _timeProvider.GetUtcNow(),
            Action = action,
            Succeeded = succeeded,
            ActorUserId = _user.Id,
            TargetUserId = targetUserId,
            TargetUserName = targetUserName,
            RoleOrPermission = roleOrPermission,
            IpAddress = _requestContext.IpAddress,
            UserAgent = _requestContext.UserAgent,
            Details = details
        });

        await _context.SaveChangesAsync(cancellationToken);
    }
}
