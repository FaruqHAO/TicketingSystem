using System.Reflection;

namespace TicketingSystem.Domain.Constants;

/// <summary>
/// The catalog of granular permissions used for permission-based authorization.
/// <para>
/// Each value follows the dotted convention <c>Permissions.{Group}.{Action}</c> so that a single
/// string serves simultaneously as: the constant, the authorization policy name
/// (<c>[Authorize(Policy = Permissions.Tickets.Create)]</c> / <c>RequireAuthorization(...)</c>),
/// and the claim value stored against a role (claim type <see cref="ClaimType"/>).
/// </para>
/// </summary>
public static class Permissions
{
    /// <summary>The claim type under which permissions are stored on roles and users.</summary>
    public const string ClaimType = "permission";

    /// <summary>
    /// Prefix shared by every permission value. Used by the dynamic authorization policy provider
    /// to distinguish permission policies from other named policies.
    /// </summary>
    public const string Prefix = "Permissions.";

    public static class Tickets
    {
        public const string View = "Permissions.Tickets.View";
        public const string ViewAll = "Permissions.Tickets.ViewAll";
        public const string Create = "Permissions.Tickets.Create";
        public const string Edit = "Permissions.Tickets.Edit";
        public const string Delete = "Permissions.Tickets.Delete";
        public const string Assign = "Permissions.Tickets.Assign";
        public const string ChangeStatus = "Permissions.Tickets.ChangeStatus";
        public const string Comment = "Permissions.Tickets.Comment";
    }

    public static class Users
    {
        public const string View = "Permissions.Users.View";
        public const string Create = "Permissions.Users.Create";
        public const string Edit = "Permissions.Users.Edit";
        public const string Delete = "Permissions.Users.Delete";
    }

    public static class Roles
    {
        public const string View = "Permissions.Roles.View";
        public const string Manage = "Permissions.Roles.Manage";
    }

    public static class Reports
    {
        public const string View = "Permissions.Reports.View";
    }

    public static class Audit
    {
        public const string View = "Permissions.Audit.View";
    }

    /// <summary>
    /// Every permission value declared in this catalog, discovered by reflection over the
    /// public string constants of the nested types.
    /// </summary>
    public static IReadOnlyList<string> All { get; } =
        typeof(Permissions)
            .GetNestedTypes(BindingFlags.Public | BindingFlags.Static)
            .SelectMany(t => t.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy))
            .Where(f => f is { IsLiteral: true, IsInitOnly: false } && f.FieldType == typeof(string))
            .Select(f => (string)f.GetRawConstantValue()!)
            .ToArray();
}
