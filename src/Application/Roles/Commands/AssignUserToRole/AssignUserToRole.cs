using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Application.Common.Security;
using TicketingSystem.Domain.Constants;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Roles.Commands.AssignUserToRole;

[Authorize(Policy = Permissions.Roles.Manage)]
public record AssignUserToRoleCommand : IRequest
{
    public string UserId { get; init; } = string.Empty;

    public string Role { get; init; } = string.Empty;
}

public class AssignUserToRoleCommandHandler : IRequestHandler<AssignUserToRoleCommand>
{
    private readonly IRoleService _roleService;
    private readonly IAuditService _auditService;

    public AssignUserToRoleCommandHandler(IRoleService roleService, IAuditService auditService)
    {
        _roleService = roleService;
        _auditService = auditService;
    }

    public async Task Handle(AssignUserToRoleCommand request, CancellationToken cancellationToken)
    {
        var result = await _roleService.AssignUserToRoleAsync(request.UserId, request.Role, cancellationToken);

        await _auditService.RecordAsync(
            AuthAuditAction.RoleAssigned,
            result.Succeeded,
            targetUserId: request.UserId,
            roleOrPermission: request.Role,
            details: result.Succeeded ? null : string.Join("; ", result.Errors),
            cancellationToken: cancellationToken);

        result.EnsureSuccess();
    }
}
