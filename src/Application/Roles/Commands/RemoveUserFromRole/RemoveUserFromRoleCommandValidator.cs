namespace TicketingSystem.Application.Roles.Commands.RemoveUserFromRole;

public class RemoveUserFromRoleCommandValidator : AbstractValidator<RemoveUserFromRoleCommand>
{
    public RemoveUserFromRoleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();

        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(role => Domain.Constants.Roles.All.Contains(role))
            .WithMessage("Unknown role.");
    }
}
