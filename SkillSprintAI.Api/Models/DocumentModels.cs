namespace SkillSprintAI.Api.Models;

public class DocumentMetadata
{
    public int Id { get; set; }
    public string DocumentId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // PDF or DOCX
    public string Version { get; set; } = "1.0";
    public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;
}

public class DocumentChunk
{
    public int Id { get; set; }
    public string ChunkId { get; set; } = string.Empty;
    public int DocumentMetadataId { get; set; }
    public DocumentMetadata? Document { get; set; }
    public string SectionId { get; set; } = string.Empty;
    public string Heading { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string PageOrLocation { get; set; } = string.Empty;
    
    // RAG Support: Store embedding vector as JSON string for SQLite MVP
    public string? EmbeddingVectorJson { get; set; }
}
