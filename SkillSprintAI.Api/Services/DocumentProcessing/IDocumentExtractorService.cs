using SkillSprintAI.Api.Models;

namespace SkillSprintAI.Api.Services.DocumentProcessing;

public interface IDocumentExtractorService
{
    Task<List<DocumentChunk>> ExtractTextAsync(IFormFile file, string documentId, string version);
}
