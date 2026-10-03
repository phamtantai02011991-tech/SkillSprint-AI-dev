using Microsoft.EntityFrameworkCore;
using SkillSprintAI.Api.Models;

namespace SkillSprintAI.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<DocumentMetadata> DocumentMetadata { get; set; } = null!;
    public DbSet<DocumentChunk> DocumentChunks { get; set; } = null!;
    public DbSet<DocumentJob> DocumentJobs { get; set; } = null!;
    public DbSet<AppUser> Users { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<DocumentChunk>()
            .HasOne(c => c.Document)
            .WithMany()
            .HasForeignKey(c => c.DocumentMetadataId);
    }
}
