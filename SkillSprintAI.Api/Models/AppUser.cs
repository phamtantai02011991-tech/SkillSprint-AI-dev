using System.ComponentModel.DataAnnotations;

namespace SkillSprintAI.Api.Models;

public class AppUser
{
    [Key]
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "Admin" or "Employee"
    public string Department { get; set; } = string.Empty; // Vị trí phòng ban
    
    // Quản lý trạng thái tài khoản
    public bool IsActive { get; set; } = true; // Khóa tài khoản
    public bool IsDeleted { get; set; } = false; // Xóa mềm (Soft Delete)
}
