namespace TicketingSystem.Application.Common.Models;

/// <summary>
/// A role together with the granular permissions currently granted to it (its <c>permission</c>
/// role-claims).
/// </summary>
public record RoleDetail(string Name, IReadOnlyList<string> Permissions);
