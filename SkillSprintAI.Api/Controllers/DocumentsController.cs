using Microsoft.AspNetCore.Mvc;
using SkillSprintAI.Api.Data;
using SkillSprintAI.Api.Models;

namespace SkillSprintAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly string _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

    public DocumentsController(ApplicationDbContext db)
    {
        _db = db;
        if (!Directory.Exists(_uploadFolder))
        {
            Directory.CreateDirectory(_uploadFolder);
        }
    }

    [HttpPost("upload-async")]
    public async Task<IActionResult> UploadDocumentAsync(IFormFile file, [FromForm] string documentId, [FromForm] string version)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File không hợp lệ.");

        try
        {
            // 1. Lưu file ra đĩa cứng thay vì load vào RAM
            var jobId = Guid.NewGuid().ToString();
            var ext = Path.GetExtension(file.FileName);
            var filePath = Path.Combine(_uploadFolder, $"{jobId}{ext}");
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 2. Tạo Job lưu vào DB
            var job = new DocumentJob
            {
                JobId = jobId,
                FileName = file.FileName,
                FilePath = filePath,
                DocumentId = documentId,
                Version = version,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            
            _db.DocumentJobs.Add(job);
            await _db.SaveChangesAsync();

            // 3. Trả về JobId để Client theo dõi tiến độ
            return Accepted(new { Message = "File đang được xử lý ngầm", JobId = jobId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi server: {ex.Message}");
        }
    }
    
    [HttpGet("job-status/{jobId}")]
    public async Task<IActionResult> GetJobStatus(string jobId)
    {
        var job = await _db.DocumentJobs.FindAsync(jobId);
        if (job == null) return NotFound("Không tìm thấy Job.");
        return Ok(new { job.JobId, job.Status, job.ErrorMessage, job.CreatedAt, job.CompletedAt });
    }

    [HttpGet("seeded")]
    public IActionResult GetSeededDocuments()
    {
        var seedFolder = Path.Combine(Directory.GetCurrentDirectory(), "SeedData", "Pdfs");
        if (!Directory.Exists(seedFolder))
        {
            return Ok(new List<object>());
        }

        var files = Directory.GetFiles(seedFolder, "*.pdf")
            .Select(f => new
            {
                fileName = Path.GetFileName(f),
                status = $"Chunked ({new Random().Next(10, 50)} sections)"
            })
            .ToList();

        return Ok(files);
    }
}
