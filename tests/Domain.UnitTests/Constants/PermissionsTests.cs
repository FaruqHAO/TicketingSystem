using NUnit.Framework;
using Shouldly;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Domain.UnitTests.Constants;

public class PermissionsTests
{
    [Test]
    public void All_ShouldNotBeEmpty()
    {
        Permissions.All.ShouldNotBeEmpty();
    }

    [Test]
    public void All_ShouldContainNoDuplicates()
    {
        Permissions.All.Distinct().Count().ShouldBe(Permissions.All.Count);
    }

    [Test]
    public void All_ValuesShouldAllStartWithPrefix()
    {
        Permissions.All.ShouldAllBe(p => p.StartsWith(Permissions.Prefix));
    }

    [Test]
    public void All_ValuesShouldNotBeNullOrWhiteSpace()
    {
        Permissions.All.ShouldAllBe(p => !string.IsNullOrWhiteSpace(p));
    }

    [Test]
    public void ClaimType_ShouldBePermission()
    {
        Permissions.ClaimType.ShouldBe("permission");
    }

    [Test]
    public void Prefix_ShouldBePermissionsDot()
    {
        Permissions.Prefix.ShouldBe("Permissions.");
    }

    [Test]
    public void All_ShouldIncludeARepresentativePermissionFromEachGroup()
    {
        Permissions.All.ShouldContain(Permissions.Tickets.Create);
        Permissions.All.ShouldContain(Permissions.Users.View);
        Permissions.All.ShouldContain(Permissions.Roles.Manage);
        Permissions.All.ShouldContain(Permissions.Reports.View);
        Permissions.All.ShouldContain(Permissions.Audit.View);
    }
}
