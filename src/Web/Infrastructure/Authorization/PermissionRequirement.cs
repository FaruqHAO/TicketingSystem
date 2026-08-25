using Microsoft.AspNetCore.Authorization;

namespace TicketingSystem.Web.Infrastructure.Authorization;

/// <summary>
/// Authorization requirement satisfied when the current principal holds a <c>permission</c> claim
/// whose value equals <see cref="Permission"/>.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }

    public string Permission { get; }
}
