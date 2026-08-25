using NUnit.Framework;
using Shouldly;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Domain.UnitTests.Constants;

public class RolesTests
{
    [Test]
    public void All_ShouldContainTheFourApplicationRoles()
    {
        Roles.All.ShouldBe(
            new[] { Roles.Administrator, Roles.Manager, Roles.Agent, Roles.Customer },
            ignoreOrder: true);
    }

    [Test]
    public void All_ShouldContainNoDuplicates()
    {
        Roles.All.Distinct().Count().ShouldBe(Roles.All.Count);
    }

    [Test]
    public void All_ShouldMatchDefaultRolePermissionKeys()
    {
        Roles.All.ShouldBe(DefaultRolePermissions.Map.Keys, ignoreOrder: true);
    }
}
