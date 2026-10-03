using System.ComponentModel.DataAnnotations;

namespace SkillSprintAI.Api.Models;

public class DocumentJob
{
    [Key]
    public string JobId { get; set; } = Guid.NewGuid().ToString();
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string DocumentId { get; set; } = string.Empty;
    public string Version { get; set; } = "1.0";
    
    // Status: Pending, Processing, Completed, Failed
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
