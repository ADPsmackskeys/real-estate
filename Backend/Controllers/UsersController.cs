using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Phone,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user is null) return NotFound();
            return Ok(user);
        }

        // POST /api/users/register
        // Body: { "fullName": "Jane Doe", "email": "jane@email.com", "phone": "...", "passwordHash": "..." }
        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            var emailTaken = await _context.Users.AnyAsync(u => u.Email == user.Email);
            if (emailTaken) return Conflict("An account with this email already exists.");

            // NOTE: In production, hash the password here before storing.
            // e.g. user.PasswordHash = BCrypt.HashPassword(user.PasswordHash);

            user.CreatedAt = DateTime.UtcNow;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.CreatedAt
            });
        }

        // PUT /api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return NotFound();

            user.FullName = dto.FullName;
            user.Phone    = dto.Phone;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Phone   { get; set; }
    }
}