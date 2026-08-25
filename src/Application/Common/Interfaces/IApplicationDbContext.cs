using TicketingSystem.Domain.Entities;

namespace TicketingSystem.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<AuditTrail> AuditTrails { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
