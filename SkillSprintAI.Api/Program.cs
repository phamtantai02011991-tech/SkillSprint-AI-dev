using Microsoft.EntityFrameworkCore;
using SkillSprintAI.Api.Data;
using SkillSprintAI.Api.Services.DocumentProcessing;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database setup (SQLite for Phase 1)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=SkillSprintAI.db"));

// Register Document Extractor Service
builder.Services.AddScoped<IDocumentExtractorService, DocumentExtractorService>();

// Register Python Validation Client & Gemini Service
builder.Services.AddScoped<SkillSprintAI.Api.Services.ValidationClient.IPythonValidationClient, SkillSprintAI.Api.Services.ValidationClient.PythonValidationClient>();
builder.Services.AddHttpClient<SkillSprintAI.Api.Services.GenAiPipeline.IGeminiGeneratorService, SkillSprintAI.Api.Services.GenAiPipeline.GeminiGeneratorService>();

// Register RAG and Background Worker
builder.Services.AddHttpClient<SkillSprintAI.Api.Services.RAG.IEmbeddingService, SkillSprintAI.Api.Services.RAG.GeminiEmbeddingService>();
builder.Services.AddHostedService<SkillSprintAI.Api.Services.BackgroundJobs.DocumentProcessingBackgroundService>();

// Cấu hình CORS để Frontend (React) có thể gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

// Database Seeding Logic (Tự tạo tài khoản mẫu khi khởi động)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SkillSprintAI.Api.Data.ApplicationDbContext>();
    db.Database.EnsureCreated(); // Đảm bảo bảng được tạo
    
    if (!db.Users.Any())
    {
        db.Users.AddRange(
            new SkillSprintAI.Api.Models.AppUser { Email = "sysadmin@skillsprint.ai", PasswordHash = "admin123", FullName = "System Administrator", Role = "SystemAdmin", Department = "IT" },
            new SkillSprintAI.Api.Models.AppUser { Email = "hr@skillsprint.ai", PasswordHash = "hr123", FullName = "HR Manager", Role = "HR", Department = "Human Resources" },
            new SkillSprintAI.Api.Models.AppUser { Email = "alex@skillsprint.ai", PasswordHash = "emp123", FullName = "Alex (Nhân viên mới)", Role = "Employee", Department = "Customer Support" },
            new SkillSprintAI.Api.Models.AppUser { Email = "mike@skillsprint.ai", PasswordHash = "emp123", FullName = "Mike (Nhân viên tài chính)", Role = "Employee", Department = "Finance" },
            new SkillSprintAI.Api.Models.AppUser { Email = "reviewer@skillsprint.ai", PasswordHash = "rev123", FullName = "QA Reviewer", Role = "Reviewer", Department = "Quality Assurance" }
        );
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Ensure DB is created on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
