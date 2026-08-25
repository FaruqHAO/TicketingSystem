using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TicketingSystem.Domain.Constants;
using TicketingSystem.Domain.Entities;
using TicketingSystem.Domain.ValueObjects;
using TicketingSystem.Infrastructure.Identity;

namespace TicketingSystem.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IHostEnvironment _environment;

    public ApplicationDbContextInitialiser(
        ILogger<ApplicationDbContextInitialiser> logger,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IHostEnvironment environment)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _environment = environment;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            // Apply migrations so the schema (Identity + Todo + AuditTrail) is created/updated in a
            // way that is safe to run repeatedly and consistent across dev, test, and production.
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        await SeedRolesAndPermissionsAsync();

        // Default administrator.
        var administrator = new ApplicationUser { UserName = "administrator@localhost", Email = "administrator@localhost" };

        if (_userManager.Users.All(u => u.UserName != administrator.UserName))
        {
            await _userManager.CreateAsync(administrator, "Administrator1!");
            await _userManager.AddToRolesAsync(administrator, [Roles.Administrator]);
        }

        // Development/test users — one per role — so authorization can be exercised end-to-end.
        // Never seeded in Production.
        if (!_environment.IsProduction())
        {
            await SeedDevUserAsync("manager@localhost", "Manager1!Pass", Roles.Manager);
            await SeedDevUserAsync("agent@localhost", "Agent1!Passwd", Roles.Agent);
            await SeedDevUserAsync("customer@localhost", "Customer1!Pass", Roles.Customer);
        }

        // Default data
        if (!_context.TodoLists.Any())
        {
            _context.TodoLists.Add(new TodoList
            {
                Title = "Tasks",
                Colour = Colour.Green,
                Items =
                {
                    new TodoItem { Title = "Make a todo list 📃" },
                    new TodoItem { Title = "Check off the first item ✅" },
                    new TodoItem { Title = "Realise you've already done two things on the list! 🤯"},
                    new TodoItem { Title = "Reward yourself with a nice, long nap 🏆" },
                }
            });

            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Ensures every role in <see cref="DefaultRolePermissions.Map"/> exists and carries exactly the
    /// permission role-claims it is granted. Additive and idempotent, so it can run on every startup.
    /// </summary>
    private async Task SeedRolesAndPermissionsAsync()
    {
        foreach (var (roleName, permissions) in DefaultRolePermissions.Map)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role is null)
            {
                role = new IdentityRole(roleName);
                await _roleManager.CreateAsync(role);
            }

            var existing = (await _roleManager.GetClaimsAsync(role))
                .Where(c => c.Type == Permissions.ClaimType)
                .Select(c => c.Value)
                .ToHashSet();

            foreach (var permission in permissions)
            {
                if (existing.Add(permission))
                {
                    await _roleManager.AddClaimAsync(role, new Claim(Permissions.ClaimType, permission));
                }
            }
        }
    }

    private async Task SeedDevUserAsync(string email, string password, string role)
    {
        if (_userManager.Users.Any(u => u.UserName == email))
        {
            return;
        }

        var user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };

        var result = await _userManager.CreateAsync(user, password);
        if (result.Succeeded)
        {
            await _userManager.AddToRolesAsync(user, [role]);
        }
        else
        {
            _logger.LogWarning("Failed to seed development user {Email}: {Errors}",
                email, string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }
}
