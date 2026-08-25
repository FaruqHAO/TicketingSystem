using NUnit.Framework;
using Shouldly;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Domain.UnitTests.Constants;

public class DefaultRolePermissionsTests
{
    [Test]
    public void Map_KeysShouldMatchRolesAll()
    {
        DefaultRolePermissions.Map.Keys.ShouldBe(Roles.All, ignoreOrder: true);
    }

    [Test]
    public void Map_EveryReferencedPermissionShouldBeInTheCatalog()
    {
        var referenced = DefaultRolePermissions.Map.Values.SelectMany(p => p).Distinct();

        referenced.ShouldAllBe(p => Permissions.All.Contains(p));
    }

    [Test]
    public void Map_AdministratorShouldHaveEveryPermission()
    {
        DefaultRolePermissions.Map[Roles.Administrator].ShouldBe(Permissions.All, ignoreOrder: true);
    }

    [Test]
    public void Map_NoRoleShouldListDuplicatePermissions()
    {
        foreach (var (role, permissions) in DefaultRolePermissions.Map)
        {
            permissions.Distinct().Count().ShouldBe(permissions.Length, $"role '{role}' lists a duplicate permission");
        }
    }

    [Test]
    public void Map_EveryRoleShouldGrantAtLeastOnePermission()
    {
        DefaultRolePermissions.Map.Values.ShouldAllBe(p => p.Length > 0);
    }
}
