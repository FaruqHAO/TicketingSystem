using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Infrastructure.Identity;

/// <summary>
/// Resolves the permissions granted to a role (stored as role claims of type
/// <see cref="Permissions.ClaimType"/>), caching the result in memory so permission lookups do not
/// hit the database on every request. Invalidate a role when its permission claims change.
/// </summary>
public interface IRolePermissionCache
{
    Task<IReadOnlyCollection<string>> GetPermissionsForRoleAsync(string roleName);

    void Invalidate(string roleName);
}

public class RolePermissionCache : IRolePermissionCache
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    private readonly IMemoryCache _cache;
    private readonly RoleManager<IdentityRole> _roleManager;

    public RolePermissionCache(IMemoryCache cache, RoleManager<IdentityRole> roleManager)
    {
        _cache = cache;
        _roleManager = roleManager;
    }

    public async Task<IReadOnlyCollection<string>> GetPermissionsForRoleAsync(string roleName)
    {
        if (_cache.TryGetValue(KeyFor(roleName), out IReadOnlyCollection<string>? cached) && cached is not null)
        {
            return cached;
        }

        var role = await _roleManager.FindByNameAsync(roleName);

        IReadOnlyCollection<string> permissions = role is null
            ? []
            : (await _roleManager.GetClaimsAsync(role))
                .Where(c => c.Type == Permissions.ClaimType)
                .Select(c => c.Value)
                .ToArray();

        _cache.Set(KeyFor(roleName), permissions, CacheDuration);

        return permissions;
    }

    public void Invalidate(string roleName) => _cache.Remove(KeyFor(roleName));

    private static string KeyFor(string roleName) => $"role-permissions:{roleName}";
}
