using System.Security.Claims;

using TicketingSystem.Application.Common.Interfaces;

namespace TicketingSystem.Web.Services;

public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? Id => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public List<string>? Roles => _httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(x => x.Value).ToList();

    public IReadOnlyCollection<string>? Permissions => _httpContextAccessor.HttpContext?.User?
        .FindAll(Domain.Constants.Permissions.ClaimType).Select(x => x.Value).ToArray();
}
