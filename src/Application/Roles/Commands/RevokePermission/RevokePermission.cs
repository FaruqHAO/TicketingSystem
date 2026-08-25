using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Application.Common.Security;
using TicketingSystem.Domain.Constants;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Roles.Commands.RevokePermission;

[Authorize(Policy = Permissions.Roles.Manage)]
public record RevokePermissionCommand : IRequest
{
    public string RoleName { get; init; } = string.Empty;

    public string Permission { get; init; } = string.Empty;
}

public class RevokePermissionCommandHandler : IRequestHandler<RevokePermissionCommand>
{
    private readonly IRoleService _roleService;
    private readonly IAuditService _auditService;

    public RevokePermissionCommandHandler(IRoleService roleService, IAuditService auditService)
    {
        _roleService = roleService;
        _auditService = auditService;
    }

    public async Task Handle(RevokePermissionCommand request, CancellationToken cancellationToken)
    {
        var result = await _roleService.RevokePermissionAsync(request.RoleName, request.Permission, cancellationToken);

        await _auditService.RecordAsync(
            AuthAuditAction.RolePermissionRevoked,
            result.Succeeded,
            roleOrPermission: $"{request.RoleName}:{request.Permission}",
            details: result.Succeeded ? null : string.Join("; ", result.Errors),
            cancellationToken: cancellationToken);

        result.EnsureSuccess();
    }
}
