using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TicketingSystem.Domain.Entities;

namespace TicketingSystem.Infrastructure.Data.Configurations;

public class AuditTrailConfiguration : IEntityTypeConfiguration<AuditTrail>
{
    public void Configure(EntityTypeBuilder<AuditTrail> builder)
    {
        // Store the action as a readable string rather than an integer.
        builder.Property(a => a.Action)
            .HasConversion<string>()
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(a => a.ActorUserId).HasMaxLength(256);
        builder.Property(a => a.ActorUserName).HasMaxLength(256);
        builder.Property(a => a.TargetUserId).HasMaxLength(256);
        builder.Property(a => a.TargetUserName).HasMaxLength(256);
        builder.Property(a => a.RoleOrPermission).HasMaxLength(256);
        builder.Property(a => a.IpAddress).HasMaxLength(64);
        builder.Property(a => a.UserAgent).HasMaxLength(512);
        builder.Property(a => a.Details).HasMaxLength(2000);

        builder.HasIndex(a => a.Timestamp);
        builder.HasIndex(a => a.ActorUserId);
        builder.HasIndex(a => a.Action);
    }
}
