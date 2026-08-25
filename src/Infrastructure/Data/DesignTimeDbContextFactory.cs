using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TicketingSystem.Infrastructure.Data;

/// <summary>
/// Enables <c>dotnet ef</c> tooling to construct an <see cref="ApplicationDbContext"/> at design time.
/// At runtime the connection string is supplied by Aspire/AppHost; the tooling has no such host, so
/// it reads the <c>EF_DESIGN_CONNECTION</c> environment variable, falling back to a local default.
/// Note: <c>migrations add</c> does not connect to the database — this only needs to parse.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("EF_DESIGN_CONNECTION")
            ?? "Host=localhost;Port=5433;Database=TicketingSystemDb;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new ApplicationDbContext(options);
    }
}
