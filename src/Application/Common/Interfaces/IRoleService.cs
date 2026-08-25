using TicketingSystem.Application.Common.Models;

namespace TicketingSystem.Application.Common.Interfaces;

/// <summary>
/// Administration of roles and their permissions, and of user↔role membership. Implemented in the
/// Infrastructure layer over ASP.NET Core Identity's role/user stores; mutations invalidate the
/// role→permission cache so changes take effect promptly.
/// </summary>
public interface IRoleService
{
    Task<IReadOnlyList<RoleDetail>> GetRolesWithPermissionsAsync(CancellationToken cancellationToken = default);

    Task<Result> GrantPermissionAsync(string roleName, string permission, CancellationToken cancellationToken = default);

    Task<Result> RevokePermissionAsync(string roleName, string permission, CancellationToken cancellationToken = default);

    Task<Result> AssignUserToRoleAsync(string userId, string roleName, CancellationToken cancellationToken = default);

    Task<Result> RemoveUserFromRoleAsync(string userId, string roleName, CancellationToken cancellationToken = default);
}
