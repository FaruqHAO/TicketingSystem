using TicketingSystem.Domain.Entities;

namespace TicketingSystem.Application.Audit.Queries.GetAuditTrail;

public class AuditTrailDto
{
    public long Id { get; init; }

    public DateTimeOffset Timestamp { get; init; }

    public string Action { get; init; } = string.Empty;

    public bool Succeeded { get; init; }

    public string? ActorUserId { get; init; }

    public string? ActorUserName { get; init; }

    public string? TargetUserId { get; init; }

    public string? TargetUserName { get; init; }

    public string? RoleOrPermission { get; init; }

    public string? IpAddress { get; init; }

    public string? UserAgent { get; init; }

    public string? Details { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            // Action (enum) projects to its string name.
            CreateMap<AuditTrail, AuditTrailDto>();
        }
    }
}
