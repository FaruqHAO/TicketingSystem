using MediatR;
using Moq;
using NUnit.Framework;
using Shouldly;
using TicketingSystem.Application.Common.Behaviours;
using TicketingSystem.Application.Common.Exceptions;
using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Application.Common.Security;
using TicketingSystem.Domain.Constants;

namespace TicketingSystem.Application.UnitTests.Common.Behaviours;

// The Application.Roles CQRS namespace (enclosing TicketingSystem.Application scope) shadows the
// Domain.Constants.Roles class. A using-alias inside this namespace is the innermost scope, so it
// resolves the simple name 'Roles' back to the constants class.
using Roles = TicketingSystem.Domain.Constants.Roles;

public class AuthorizationBehaviourTests
{
    private const string Policy = Permissions.Tickets.Create;

    private Mock<IUser> _user = null!;
    private Mock<IIdentityService> _identityService = null!;

    [SetUp]
    public void Setup()
    {
        _user = new Mock<IUser>();
        _identityService = new Mock<IIdentityService>();
    }

    private AuthorizationBehaviour<TRequest, string> BehaviourFor<TRequest>() where TRequest : notnull
        => new(_user.Object, _identityService.Object);

    private static (RequestHandlerDelegate<string> next, Func<bool> wasCalled) TrackedNext()
    {
        var called = false;
        RequestHandlerDelegate<string> next = _ =>
        {
            called = true;
            return Task.FromResult("ok");
        };
        return (next, () => called);
    }

    // A request with no [Authorize] attribute — authorization is not required.
    private sealed class UnguardedRequest;

    [Authorize]
    private sealed class AuthenticatedOnlyRequest;

    [Authorize(Roles = Roles.Administrator)]
    private sealed class AdminRoleRequest;

    [Authorize(Policy = Policy)]
    private sealed class PolicyRequest;

    [Test]
    public async Task Handle_WhenNoAuthorizeAttribute_CallsNextEvenWhenUnauthenticated()
    {
        var (next, wasCalled) = TrackedNext();

        var result = await BehaviourFor<UnguardedRequest>()
            .Handle(new UnguardedRequest(), next, CancellationToken.None);

        wasCalled().ShouldBeTrue();
        result.ShouldBe("ok");
    }

    [Test]
    public async Task Handle_WhenAuthorizeAndUserNotAuthenticated_ThrowsUnauthorized()
    {
        _user.SetupGet(x => x.Id).Returns((string?)null);
        var (next, wasCalled) = TrackedNext();

        await Should.ThrowAsync<UnauthorizedAccessException>(() =>
            BehaviourFor<AuthenticatedOnlyRequest>().Handle(new AuthenticatedOnlyRequest(), next, CancellationToken.None));

        wasCalled().ShouldBeFalse();
    }

    [Test]
    public async Task Handle_WhenAuthorizeAndUserAuthenticated_CallsNext()
    {
        _user.SetupGet(x => x.Id).Returns(Guid.NewGuid().ToString());
        var (next, wasCalled) = TrackedNext();

        await BehaviourFor<AuthenticatedOnlyRequest>().Handle(new AuthenticatedOnlyRequest(), next, CancellationToken.None);

        wasCalled().ShouldBeTrue();
    }

    [Test]
    public async Task Handle_WhenPolicySatisfied_CallsNext()
    {
        _user.SetupGet(x => x.Id).Returns("user-1");
        _identityService.Setup(x => x.AuthorizeAsync("user-1", Policy)).ReturnsAsync(true);
        var (next, wasCalled) = TrackedNext();

        await BehaviourFor<PolicyRequest>().Handle(new PolicyRequest(), next, CancellationToken.None);

        wasCalled().ShouldBeTrue();
        _identityService.Verify(x => x.AuthorizeAsync("user-1", Policy), Times.Once);
    }

    [Test]
    public async Task Handle_WhenPolicyDenied_ThrowsForbiddenAndDoesNotCallNext()
    {
        _user.SetupGet(x => x.Id).Returns("user-1");
        _identityService.Setup(x => x.AuthorizeAsync("user-1", Policy)).ReturnsAsync(false);
        var (next, wasCalled) = TrackedNext();

        await Should.ThrowAsync<ForbiddenAccessException>(() =>
            BehaviourFor<PolicyRequest>().Handle(new PolicyRequest(), next, CancellationToken.None));

        wasCalled().ShouldBeFalse();
    }

    [Test]
    public async Task Handle_WhenRoleMatches_CallsNext()
    {
        _user.SetupGet(x => x.Id).Returns("user-1");
        _user.SetupGet(x => x.Roles).Returns([Roles.Administrator]);
        var (next, wasCalled) = TrackedNext();

        await BehaviourFor<AdminRoleRequest>().Handle(new AdminRoleRequest(), next, CancellationToken.None);

        wasCalled().ShouldBeTrue();
    }

    [Test]
    public async Task Handle_WhenRoleDoesNotMatch_ThrowsForbidden()
    {
        _user.SetupGet(x => x.Id).Returns("user-1");
        _user.SetupGet(x => x.Roles).Returns([Roles.Customer]);
        var (next, wasCalled) = TrackedNext();

        await Should.ThrowAsync<ForbiddenAccessException>(() =>
            BehaviourFor<AdminRoleRequest>().Handle(new AdminRoleRequest(), next, CancellationToken.None));

        wasCalled().ShouldBeFalse();
    }
}
