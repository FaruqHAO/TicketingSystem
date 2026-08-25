using Microsoft.AspNetCore.Http.HttpResults;
using TicketingSystem.Application.Audit.Queries.GetAuditTrail;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Web.Endpoints;

public class Audit : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Baseline: must be authenticated. The Permissions.Audit.View check is enforced in the
        // MediatR handler.
        groupBuilder.RequireAuthorization();

        groupBuilder.MapGet(GetAuditTrail);
    }

    [EndpointSummary("Query the security audit trail")]
    [EndpointDescription("Returns a paged, newest-first view of security events. Optionally filter by action and actor.")]
    public static async Task<Ok<PaginatedList<AuditTrailDto>>> GetAuditTrail(
        ISender sender,
        int? pageNumber,
        int? pageSize,
        AuthAuditAction? action,
        string? actorUserId)
    {
        var result = await sender.Send(new GetAuditTrailQuery
        {
            PageNumber = pageNumber ?? 1,
            PageSize = pageSize ?? 50,
            Action = action,
            ActorUserId = actorUserId
        });

        return TypedResults.Ok(result);
    }
}
