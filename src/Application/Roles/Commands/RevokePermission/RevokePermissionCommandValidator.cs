using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Application.Roles.Commands.RevokePermission;

public class RevokePermissionCommandValidator : AbstractValidator<RevokePermissionCommand>
{
    public RevokePermissionCommandValidator()
    {
        RuleFor(x => x.RoleName)
            .NotEmpty()
            .Must(role => Domain.Constants.Roles.All.Contains(role))
            .WithMessage("Unknown role.");

        RuleFor(x => x.Permission)
            .NotEmpty()
            .Must(permission => Permissions.All.Contains(permission))
            .WithMessage("Unknown permission.");
    }
}
