using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Application.Common.Security;
using TicketingSystem.Domain.Constants;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Audit.Queries.GetAuditTrail;

[Authorize(Policy = Permissions.Audit.View)]
public record GetAuditTrailQuery : IRequest<PaginatedList<AuditTrailDto>>
{
    public int PageNumber { get; init; } = 1;

    public int PageSize { get; init; } = 50;

    public AuthAuditAction? Action { get; init; }

    public string? ActorUserId { get; init; }
}

public class GetAuditTrailQueryHandler : IRequestHandler<GetAuditTrailQuery, PaginatedList<AuditTrailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAuditTrailQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<AuditTrailDto>> Handle(GetAuditTrailQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditTrails.AsNoTracking();

        if (request.Action.HasValue)
        {
            query = query.Where(a => a.Action == request.Action.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.ActorUserId))
        {
            query = query.Where(a => a.ActorUserId == request.ActorUserId);
        }

        query = query.OrderByDescending(a => a.Timestamp);

        var count = await query.CountAsync(cancellationToken);

        var entities = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map after materialising: the Action enum→string projection does not translate to SQL.
        var items = _mapper.Map<List<AuditTrailDto>>(entities);

        return new PaginatedList<AuditTrailDto>(items, count, request.PageNumber, request.PageSize);
    }
}
