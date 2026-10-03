using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillSprintAI.Api.Data;
using SkillSprintAI.Api.Models;

namespace SkillSprintAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public UsersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        // Trả về tất cả user (Kể cả bị xóa mềm để Admin có thể xem Log)
        var users = await _db.Users.ToListAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] AppUser newUser)
    {
        if (await _db.Users.AnyAsync(u => u.Email == newUser.Email))
        {
            return BadRequest(new { Message = "Email đã tồn tại!" });
        }

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();
        return Ok(newUser);
    }

    [HttpPut("{id}/toggle-lock")]
    public async Task<IActionResult> ToggleLock(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.IsActive = !user.IsActive; // Đảo trạng thái khóa
        await _db.SaveChangesAsync();
        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        // Xóa mềm: Đánh dấu IsDeleted = true thay vì Remove()
        user.IsDeleted = true;
        user.IsActive = false; // Tự động khóa khi xóa
        await _db.SaveChangesAsync();
        
        return Ok(new { Message = "Đã xóa mềm tài khoản." });
    }

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }

    [HttpPut("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { Message = "Mật khẩu không được để trống." });
        }

        user.PasswordHash = dto.NewPassword;
        await _db.SaveChangesAsync();
        
        return Ok(new { Message = "Đã đổi mật khẩu thành công." });
    }
}
