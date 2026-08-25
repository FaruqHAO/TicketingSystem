using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Web.Infrastructure.Authorization;

/// <summary>
/// Supplies authorization policies on demand for permission names (those beginning with
/// <see cref="Permissions.Prefix"/>), so every permission does not have to be pre-registered. A
/// generated policy requires an authenticated user (via the cookie or bearer Identity schemes) plus
/// the matching <see cref="PermissionRequirement"/>. All other policy names fall through to the
/// default provider, preserving Identity's own schemes and any explicitly registered policies.
/// </summary>
public class PermissionAuthorizationPolicyProvider : DefaultAuthorizationPolicyProvider
{
    private readonly ConcurrentDictionary<string, AuthorizationPolicy> _policyCache = new(StringComparer.Ordinal);

    public PermissionAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
        : base(options)
    {
    }

    public override Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(Permissions.Prefix, StringComparison.Ordinal))
        {
            var policy = _policyCache.GetOrAdd(policyName, static name =>
                new AuthorizationPolicyBuilder(
                        IdentityConstants.ApplicationScheme, IdentityConstants.BearerScheme)
                    .RequireAuthenticatedUser()
                    .AddRequirements(new PermissionRequirement(name))
                    .Build());

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        return base.GetPolicyAsync(policyName);
    }
}
