using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Application.Common.Models;
using TicketingSystem.Application.Common.Security;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Application.Roles.Queries.GetRoles;

[Authorize(Policy = Permissions.Roles.View)]
public record GetRolesQuery : IRequest<IReadOnlyList<RoleDetail>>;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, IReadOnlyList<RoleDetail>>
{
    private readonly IRoleService _roleService;

    public GetRolesQueryHandler(IRoleService roleService)
    {
        _roleService = roleService;
    }

    public async Task<IReadOnlyList<RoleDetail>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        return await _roleService.GetRolesWithPermissionsAsync(cancellationToken);
    }
}
