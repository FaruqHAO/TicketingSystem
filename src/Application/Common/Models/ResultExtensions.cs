using FluentValidation.Results;

namespace TicketingSystem.Application.Common.Models;

public static class ResultExtensions
{
    /// <summary>
    /// Throws a <see cref="Exceptions.ValidationException"/> carrying the failure messages when the
    /// result is not successful, so a failed identity/role operation surfaces to the client as a 400.
    /// </summary>
    public static void EnsureSuccess(this Result result)
    {
        if (!result.Succeeded)
        {
            throw new Exceptions.ValidationException(
                result.Errors.Select(e => new ValidationFailure(string.Empty, e)));
        }
    }
}
