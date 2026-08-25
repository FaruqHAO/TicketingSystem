using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Infrastructure.Identity;

/// <summary>
/// Enriches the authenticated principal with granular <c>permission</c> claims derived from the
/// user's roles, so permission-based authorization policies can be evaluated directly from claims.
/// <para>
/// Runs on every authenticated request (and is invoked explicitly by <see cref="IdentityService"/>
/// for the MediatR authorization path). Role→permission lookups are memory-cached, and the method
/// is idempotent so repeated invocations never duplicate claims.
/// </para>
/// </summary>
public class PermissionClaimsTransformation : IClaimsTransformation
{
    private readonly IRolePermissionCache _rolePermissionCache;

    public PermissionClaimsTransformation(IRolePermissionCache rolePermissionCache)
    {
        _rolePermissionCache = rolePermissionCache;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
        {
            return principal;
        }

        var roles = principal.FindAll(identity.RoleClaimType).Select(c => c.Value).Distinct();

        var existing = new HashSet<string>(
            principal.FindAll(Permissions.ClaimType).Select(c => c.Value));

        foreach (var role in roles)
        {
            foreach (var permission in await _rolePermissionCache.GetPermissionsForRoleAsync(role))
            {
                if (existing.Add(permission))
                {
                    identity.AddClaim(new Claim(Permissions.ClaimType, permission));
                }
            }
        }

        return principal;
    }
}
