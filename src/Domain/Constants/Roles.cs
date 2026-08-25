namespace TicketingSystem.Domain.Constants;

public abstract class Roles
{
    public const string Administrator = nameof(Administrator);
    public const string Manager = nameof(Manager);
    public const string Agent = nameof(Agent);
    public const string Customer = nameof(Customer);

    /// <summary>
    /// All application roles. Kept in sync with <see cref="DefaultRolePermissions.Map"/>,
    /// which is asserted by a Domain unit test.
    /// </summary>
    public static IReadOnlyList<string> All { get; } =
    [
        Administrator,
        Manager,
        Agent,
        Customer
    ];
}
