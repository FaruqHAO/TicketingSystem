namespace TicketingSystem.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<string?> GetUserNameAsync(string userId);

    Task<bool> AuthorizeAsync(string userId, string policyName);
}
