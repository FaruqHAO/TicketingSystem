using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Application.Roles.Commands.GrantPermission;

public class GrantPermissionCommandValidator : AbstractValidator<GrantPermissionCommand>
{
    public GrantPermissionCommandValidator()
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
