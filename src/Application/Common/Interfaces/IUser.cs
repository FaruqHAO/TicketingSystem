namespace TicketingSystem.Application.Common.Interfaces;

public interface IUser
{
    string? Id { get; }

    List<string>? Roles { get; }

    /// <summary>
    /// The granular permissions granted to the current user (aggregated from their roles).
    /// Enables fast in-handler permission checks without a round-trip to the identity store.
    /// </summary>
    IReadOnlyCollection<string>? Permissions { get; }
}
