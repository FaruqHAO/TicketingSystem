using Microsoft.AspNetCore.Authorization;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Web.Infrastructure.Authorization;

/// <summary>
/// Grants a <see cref="PermissionRequirement"/> when the principal carries a matching
/// <c>permission</c> claim. Permission claims are placed on the principal by
/// <c>PermissionClaimsTransformation</c>, so this handler is purely claim-based and never touches
/// the database.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User.HasClaim(Permissions.ClaimType, requirement.Permission))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
