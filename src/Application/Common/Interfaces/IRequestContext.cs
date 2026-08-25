namespace TicketingSystem.Application.Common.Interfaces;

/// <summary>
/// Provides transport-level context about the current request (e.g. client IP and user agent)
/// to layers that have no access to <c>HttpContext</c>. Implemented in the Web layer.
/// </summary>
public interface IRequestContext
{
    string? IpAddress { get; }

    string? UserAgent { get; }
}
