using TicketingSystem.Application.Common.Interfaces;

namespace TicketingSystem.Web.Services;

/// <summary>
/// Exposes ambient HTTP request metadata (client IP and user-agent) to layers that must not depend
/// on ASP.NET Core directly — notably the audit service. Values are truncated to the audit column
/// limits so a hostile or oversized user-agent header can never break a write.
/// </summary>
public class RequestContext : IRequestContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RequestContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? IpAddress =>
        Trim(_httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(), 64);

    public string? UserAgent =>
        Trim(_httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString(), 512);

    private static string? Trim(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
