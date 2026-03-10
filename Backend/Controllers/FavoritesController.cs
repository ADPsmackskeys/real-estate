using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/favorites/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists) return NotFound("User not found.");

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Property)
                    .ThenInclude(p => p!.Agent)
                .OrderByDescending(f => f.SavedAt)
                .Select(f => new
                {
                    f.Id,
                    f.Tag,
                    f.Note,
                    f.SavedAt,
                    Property = new
                    {
                        f.Property!.Id,
                        f.Property.Title,
                        f.Property.Type,
                        f.Property.Status,
                        f.Property.Price,
                        f.Property.Bedrooms,
                        f.Property.Bathrooms,
                        f.Property.AreaSqFt,
                        f.Property.City,
                        f.Property.Locality,
                        Agent = new { f.Property.Agent!.Name, f.Property.Agent.Phone }
                    }
                })
                .ToListAsync();

            return Ok(favorites);
        }

        // POST /api/favorites
        // Body: { "userId": 1, "propertyId": 5, "tag": "Shortlisted", "note": "Great view" }
        [HttpPost]
        public async Task<IActionResult> Add(Favorite favorite)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == favorite.UserId);
            if (!userExists) return NotFound("User not found.");

            var propertyExists = await _context.Properties.AnyAsync(p => p.Id == favorite.PropertyId);
            if (!propertyExists) return NotFound("Property not found.");

            // Check for duplicate (enforced by DB too, but catch it gracefully here)
            var alreadySaved = await _context.Favorites
                .AnyAsync(f => f.UserId == favorite.UserId && f.PropertyId == favorite.PropertyId);
            if (alreadySaved) return Conflict("Property already saved by this user.");

            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByUser), new { userId = favorite.UserId }, favorite);
        }

        // PATCH /api/favorites/{id}
        // Update tag or note on an existing favorite
        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFavoriteDto dto)
        {
            var favorite = await _context.Favorites.FindAsync(id);
            if (favorite is null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Tag))
                favorite.Tag = dto.Tag;

            favorite.Note = dto.Note; // allow clearing note by passing null

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/favorites/{userId}/{propertyId}
        [HttpDelete("{userId}/{propertyId}")]
        public async Task<IActionResult> Remove(int userId, int propertyId)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.PropertyId == propertyId);

            if (favorite is null) return NotFound();

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    // DTO for PATCH — only the fields the user can update
    public class UpdateFavoriteDto
    {
        public string? Tag  { get; set; }
        public string? Note { get; set; }
    }
}