namespace TicketingSystem.Domain.Constants;

/// <summary>
/// The default mapping of roles to the permissions they grant. Used to seed role claims in the
/// database initialiser. <see cref="Roles.Administrator"/> is granted every permission in the catalog.
/// </summary>
public static class DefaultRolePermissions
{
    public static IReadOnlyDictionary<string, string[]> Map { get; } = new Dictionary<string, string[]>
    {
        [Roles.Administrator] = Permissions.All.ToArray(),

        [Roles.Manager] =
        [
            Permissions.Tickets.View,
            Permissions.Tickets.ViewAll,
            Permissions.Tickets.Create,
            Permissions.Tickets.Edit,
            Permissions.Tickets.Assign,
            Permissions.Tickets.ChangeStatus,
            Permissions.Tickets.Comment,
            Permissions.Users.View,
            Permissions.Reports.View,
            Permissions.Audit.View
        ],

        [Roles.Agent] =
        [
            Permissions.Tickets.View,
            Permissions.Tickets.ViewAll,
            Permissions.Tickets.ChangeStatus,
            Permissions.Tickets.Comment
        ],

        [Roles.Customer] =
        [
            Permissions.Tickets.View,
            Permissions.Tickets.Create,
            Permissions.Tickets.Comment
        ]
    };
}
