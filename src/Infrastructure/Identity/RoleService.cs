using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Infrastructure.Identity;

/// <summary>
/// Administers roles, their permission claims, and user↔role membership over ASP.NET Core Identity.
/// Permission changes invalidate the <see cref="IRolePermissionCache"/> so they take effect on the
/// next request rather than after the cache TTL elapses.
/// </summary>
public class RoleService : IRoleService
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IRolePermissionCache _rolePermissionCache;

    public RoleService(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IRolePermissionCache rolePermissionCache)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _rolePermissionCache = rolePermissionCache;
    }

    public async Task<IReadOnlyList<RoleDetail>> GetRolesWithPermissionsAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _roleManager.Roles.OrderBy(r => r.Name).ToListAsync(cancellationToken);

        var details = new List<RoleDetail>(roles.Count);
        foreach (var role in roles)
        {
            var permissions = (await _roleManager.GetClaimsAsync(role))
                .Where(c => c.Type == Permissions.ClaimType)
                .Select(c => c.Value)
                .OrderBy(p => p)
                .ToArray();

            details.Add(new RoleDetail(role.Name!, permissions));
        }

        return details;
    }

    public async Task<Result> GrantPermissionAsync(string roleName, string permission, CancellationToken cancellationToken = default)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role is null)
        {
            return Result.Failure(["Role not found."]);
        }

        var claims = await _roleManager.GetClaimsAsync(role);
        if (claims.Any(c => c.Type == Permissions.ClaimType && c.Value == permission))
        {
            return Result.Success(); // Already granted — idempotent.
        }

        var result = await _roleManager.AddClaimAsync(role, new Claim(Permissions.ClaimType, permission));
        if (result.Succeeded)
        {
            _rolePermissionCache.Invalidate(roleName);
        }

        return result.ToApplicationResult();
    }

    public async Task<Result> RevokePermissionAsync(string roleName, string permission, CancellationToken cancellationToken = default)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role is null)
        {
            return Result.Failure(["Role not found."]);
        }

        var result = await _roleManager.RemoveClaimAsync(role, new Claim(Permissions.ClaimType, permission));
        if (result.Succeeded)
        {
            _rolePermissionCache.Invalidate(roleName);
        }

        return result.ToApplicationResult();
    }

    public async Task<Result> AssignUserToRoleAsync(string userId, string roleName, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Result.Failure(["User not found."]);
        }

        if (await _userManager.IsInRoleAsync(user, roleName))
        {
            return Result.Success(); // Already a member — idempotent.
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);
        return result.ToApplicationResult();
    }

    public async Task<Result> RemoveUserFromRoleAsync(string userId, string roleName, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Result.Failure(["User not found."]);
        }

        var result = await _userManager.RemoveFromRoleAsync(user, roleName);
        return result.ToApplicationResult();
    }
}
