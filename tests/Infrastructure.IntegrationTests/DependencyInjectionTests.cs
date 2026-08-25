using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Shouldly;
using TicketingSystem.Infrastructure.Identity;

namespace TicketingSystem.Infrastructure.IntegrationTests;

/// <summary>
/// Guards the DI registration that makes sign-in auditing actually fire.
///
/// Regression test for a real bug: <see cref="AuditingSignInManager"/> was registered BEFORE
/// <c>AddApiEndpoints()</c>, which internally re-registers the default
/// <see cref="SignInManager{ApplicationUser}"/>. Because <c>GetRequiredService&lt;T&gt;</c> returns the
/// LAST registration — and that is exactly how <c>MapIdentityApi</c>'s <c>/login</c> endpoint resolves
/// the sign-in manager — the plain manager handled logins and every login / failure / lockout audit
/// event was silently dropped. The auditing subclass must therefore register AFTER AddApiEndpoints().
/// </summary>
public class DependencyInjectionTests
{
    [Test]
    public void AddInfrastructureServices_registers_AuditingSignInManager_as_the_resolved_SignInManager()
    {
        var builder = Host.CreateApplicationBuilder();
        // AddInfrastructureServices guards against a missing connection string; the value is never used
        // here because no connection is opened — we only inspect the service registrations.
        builder.Configuration["ConnectionStrings:TicketingSystemDb"] =
            "Host=localhost;Port=5432;Database=placeholder;Username=placeholder;Password=placeholder";

        builder.AddInfrastructureServices();

        // The last registration wins for GetRequiredService<SignInManager<ApplicationUser>>().
        var resolved = builder.Services.Last(d => d.ServiceType == typeof(SignInManager<ApplicationUser>));

        resolved.ImplementationType.ShouldBe(typeof(AuditingSignInManager));
    }
}
