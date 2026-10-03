using Microsoft.EntityFrameworkCore;
using SkillSprintAI.Api.Data;
using SkillSprintAI.Api.Models;
using SkillSprintAI.Api.Services.DocumentProcessing;

namespace SkillSprintAI.Api.Services.BackgroundJobs;

public class DocumentProcessingBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DocumentProcessingBackgroundService> _logger;

    public DocumentProcessingBackgroundService(IServiceProvider serviceProvider, ILogger<DocumentProcessingBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Background Worker started...");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var extractor = scope.ServiceProvider.GetRequiredService<IDocumentExtractorService>();

                // Tìm job Pending
                var job = await db.DocumentJobs
                    .Where(j => j.Status == "Pending")
                    .OrderBy(j => j.CreatedAt)
                    .FirstOrDefaultAsync(stoppingToken);

                if (job != null)
                {
                    job.Status = "Processing";
                    await db.SaveChangesAsync(stoppingToken);

                    _logger.LogInformation($"Processing Job {job.JobId} - {job.FileName}");

                    // Tạo luồng đọc từ File vật lý (Stream) thay vì Memory
                    using var stream = new FileStream(job.FilePath, FileMode.Open, FileAccess.Read);
                    
                    // Giả lập IFormFile để dùng lại ExtractorService (trong thực tế nên tách logic Stream ra khỏi IFormFile)
                    var formFile = new FormFile(stream, 0, stream.Length, "file", job.FileName);
                    
                    var chunks = await extractor.ExtractTextAsync(formFile, job.DocumentId, job.Version);

                    // Lưu Metadata và Chunks
                    var metadata = new DocumentMetadata
                    {
                        DocumentId = job.DocumentId,
                        Title = job.FileName,
                        Type = Path.GetExtension(job.FileName).Replace(".", ""),
                        Version = job.Version
                    };
                    db.DocumentMetadata.Add(metadata);
                    await db.SaveChangesAsync(stoppingToken);

                    foreach (var chunk in chunks)
                    {
                        chunk.DocumentMetadataId = metadata.Id;
                    }
                    
                    // TO-DO: Tích hợp RAG Embedding ở đây trước khi lưu
                    // foreach(var chunk in chunks) { chunk.EmbeddingVectorJson = await embeddingService.GetVectorAsync(chunk.Content); }

                    db.DocumentChunks.AddRange(chunks);
                    
                    job.Status = "Completed";
                    job.CompletedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync(stoppingToken);
                    
                    _logger.LogInformation($"Completed Job {job.JobId}. Total Chunks: {chunks.Count}");
                    
                    // Xóa file tạm
                    if (File.Exists(job.FilePath)) File.Delete(job.FilePath);
                }
                else
                {
                    // Nếu không có Job, ngủ 3 giây tránh ăn CPU
                    await Task.Delay(3000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing job.");
                await Task.Delay(5000, stoppingToken); // Chờ xíu rồi retry
            }
        }
    }
}
