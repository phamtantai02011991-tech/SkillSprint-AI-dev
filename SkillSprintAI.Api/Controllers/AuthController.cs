using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSprintAI.Api.Data;
using SkillSprintAI.Api.Models;

namespace SkillSprintAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AuthController(ApplicationDbContext db)
    {
        _db = db;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        // MVP: So sánh trực tiếp PasswordHash (Thực tế phải dùng BCrypt)
        if (user == null || user.PasswordHash != request.Password)
        {
            return Unauthorized(new { Message = "Email hoặc Mật khẩu không chính xác." });
        }

        if (user.IsDeleted)
        {
            return Unauthorized(new { Message = "Tài khoản này đã bị xóa khỏi hệ thống." });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { Message = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." });
        }

        return Ok(new
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            Message = "Đăng nhập thành công"
        });
    }
}
