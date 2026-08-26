namespace TicketingSystem.Web.Models;

/// <summary>
/// The caller's identity as the SPA needs it: enough to choose a dashboard and render a role-aware
/// shell without a second round-trip. Returned for anonymous callers too, with
/// <see cref="IsAuthenticated"/> false and empty collections.
/// </summary>
public sealed class CurrentUserResponse
{
    public static CurrentUserResponse Anonymous { get; } = new();

    public bool IsAuthenticated { get; init; }

    public string? Id { get; init; }

    public string? Email { get; init; }

    /// <summary>
    /// Role names, e.g. "Administrator". The SPA maps these to the pages it will show.
    /// </summary>
    public IReadOnlyList<string> Roles { get; init; } = [];

    /// <summary>
    /// Granular server-side permissions aggregated from the caller's roles, e.g.
    /// "Permissions.Tickets.Create". Authoritative enforcement stays on the server; these let the
    /// client hide actions it knows would be refused.
    /// </summary>
    public IReadOnlyList<string> Permissions { get; init; } = [];
}
