
namespace TicketingSystem.Application.Roles.Commands.AssignUserToRole;

public class AssignUserToRoleCommandValidator : AbstractValidator<AssignUserToRoleCommand>
{
    public AssignUserToRoleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();

        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(role => Domain.Constants.Roles.All.Contains(role))
            .WithMessage("Unknown role.");
    }
}
