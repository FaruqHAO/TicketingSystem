using Microsoft.AspNetCore.Http.HttpResults;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Application.Roles.Commands.AssignUserToRole;
using TicketingSystem.Application.Roles.Commands.GrantPermission;
using TicketingSystem.Application.Roles.Commands.RemoveUserFromRole;
using TicketingSystem.Application.Roles.Commands.RevokePermission;
using TicketingSystem.Application.Roles.Queries.GetRoles;

namespace TicketingSystem.Web.Endpoints;

public class Roles : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Baseline: must be authenticated. Per-permission checks are enforced in the MediatR
        // handlers via [Authorize(Policy = Permissions.Roles.*)].
        groupBuilder.RequireAuthorization();

        groupBuilder.MapGet(GetRoles);
        groupBuilder.MapPost(GrantPermission, "permissions/grant");
        groupBuilder.MapPost(RevokePermission, "permissions/revoke");
        groupBuilder.MapPost(AssignUserToRole, "users/assign");
        groupBuilder.MapPost(RemoveUserFromRole, "users/remove");
    }

    [EndpointSummary("List roles and their permissions")]
    public static async Task<Ok<IReadOnlyList<RoleDetail>>> GetRoles(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetRolesQuery()));

    [EndpointSummary("Grant a permission to a role")]
    public static async Task<NoContent> GrantPermission(ISender sender, GrantPermissionCommand command)
    {
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    [EndpointSummary("Revoke a permission from a role")]
    public static async Task<NoContent> RevokePermission(ISender sender, RevokePermissionCommand command)
    {
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    [EndpointSummary("Assign a role to a user")]
    public static async Task<NoContent> AssignUserToRole(ISender sender, AssignUserToRoleCommand command)
    {
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    [EndpointSummary("Remove a role from a user")]
    public static async Task<NoContent> RemoveUserFromRole(ISender sender, RemoveUserFromRoleCommand command)
    {
        await sender.Send(command);
        return TypedResults.NoContent();
    }
}
