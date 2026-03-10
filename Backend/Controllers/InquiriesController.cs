using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InquiriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InquiriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/inquiries/user/{userId}
        // A user checks all their inquiries
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists) return NotFound("User not found.");

            var inquiries = await _context.Inquiries
                .Where(i => i.UserId == userId)
                .Include(i => i.Property)
                .Include(i => i.Agent)
                .OrderByDescending(i => i.SentAt)
                .Select(i => new
                {
                    i.Id,
                    i.Message,
                    i.PreferredDate,
                    i.Status,
                    i.SentAt,
                    Property = new { i.Property!.Id, i.Property.Title, i.Property.City, i.Property.Locality },
                    Agent    = new { i.Agent!.Name, i.Agent.Email, i.Agent.Phone }
                })
                .ToListAsync();

            return Ok(inquiries);
        }

        // GET /api/inquiries/agent/{agentId}
        // An agent checks all inquiries sent to them
        [HttpGet("agent/{agentId}")]
        public async Task<IActionResult> GetByAgent(int agentId)
        {
            var agentExists = await _context.Agents.AnyAsync(a => a.Id == agentId);
            if (!agentExists) return NotFound("Agent not found.");

            var inquiries = await _context.Inquiries
                .Where(i => i.AgentId == agentId)
                .Include(i => i.Property)
                .Include(i => i.User)
                .OrderByDescending(i => i.SentAt)
                .Select(i => new
                {
                    i.Id,
                    i.Message,
                    i.PreferredDate,
                    i.Status,
                    i.SentAt,
                    Property = new { i.Property!.Id, i.Property.Title, i.Property.City },
                    User     = new { i.User!.FullName, i.User.Email, i.User.Phone }
                })
                .ToListAsync();

            return Ok(inquiries);
        }

        // POST /api/inquiries
        // Body: { "userId": 1, "propertyId": 5, "agentId": 2, "message": "...", "preferredDate": "2025-06-01" }
        [HttpPost]
        public async Task<IActionResult> Create(Inquiry inquiry)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == inquiry.UserId);
            if (!userExists) return NotFound("User not found.");

            var propertyExists = await _context.Properties.AnyAsync(p => p.Id == inquiry.PropertyId);
            if (!propertyExists) return NotFound("Property not found.");

            var agentExists = await _context.Agents.AnyAsync(a => a.Id == inquiry.AgentId);
            if (!agentExists) return NotFound("Agent not found.");

            // Check for duplicate (one inquiry per user per property)
            var alreadyInquired = await _context.Inquiries
                .AnyAsync(i => i.UserId == inquiry.UserId && i.PropertyId == inquiry.PropertyId);
            if (alreadyInquired) return Conflict("You have already sent an inquiry for this property.");

            inquiry.Status = "Pending";
            inquiry.SentAt = DateTime.UtcNow;

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByUser), new { userId = inquiry.UserId }, inquiry);
        }

        // PATCH /api/inquiries/{id}/status
        // Agent updates the status of an inquiry
        // Body: { "status": "Responded" }
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInquiryStatusDto dto)
        {
            var validStatuses = new[] { "Pending", "Responded", "Closed" };
            if (!validStatuses.Contains(dto.Status))
                return BadRequest($"Invalid status. Must be one of: {string.Join(", ", validStatuses)}");

            var inquiry = await _context.Inquiries.FindAsync(id);
            if (inquiry is null) return NotFound();

            inquiry.Status = dto.Status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/inquiries/{id}
        // A user withdraws their inquiry (only if still Pending)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var inquiry = await _context.Inquiries.FindAsync(id);
            if (inquiry is null) return NotFound();

            if (inquiry.Status != "Pending")
                return BadRequest("Only pending inquiries can be withdrawn.");

            _context.Inquiries.Remove(inquiry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class UpdateInquiryStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}