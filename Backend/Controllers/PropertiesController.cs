using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PropertiesController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/properties?minPrice=100000&maxPrice=500000&city=Mumbai&locality=Bandra&type=Apartment&status=Available&sortBy=price
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string?  city,
            [FromQuery] string?  locality,
            [FromQuery] string?  type,
            [FromQuery] string?  status,
            [FromQuery] int?     minBedrooms,
            [FromQuery] double?  minArea,
            [FromQuery] double?  maxArea,
            [FromQuery] string?  sortBy)
        {
            var query = _context.Properties
                .Include(p => p.Agent)
                .AsQueryable();

            // --- Filtering ---
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(p => p.City.Contains(city));

            if (!string.IsNullOrWhiteSpace(locality))
                query = query.Where(p => p.Locality.Contains(locality));

            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(p => p.Type.ToLower() == type.ToLower());

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(p => p.Status.ToLower() == status.ToLower());

            if (minBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= minBedrooms.Value);

            if (minArea.HasValue)
                query = query.Where(p => p.AreaSqFt >= minArea.Value);

            if (maxArea.HasValue)
                query = query.Where(p => p.AreaSqFt <= maxArea.Value);

            // --- Sorting ---
            query = sortBy?.ToLower() switch
            {
                "price"      => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "newest"     => query.OrderByDescending(p => p.ListedAt),
                "area"       => query.OrderBy(p => p.AreaSqFt),
                "popular"    => query.OrderByDescending(p => p.ViewCount),
                _            => query.OrderByDescending(p => p.ListedAt) // default: newest first
            };

            // --- Projection ---
            var results = await query.Select(p => new
            {
                p.Id,
                p.Title,
                p.Type,
                p.Status,
                p.Price,
                p.Bedrooms,
                p.Bathrooms,
                p.AreaSqFt,
                p.Address,
                p.City,
                p.Locality,
                p.Latitude,
                p.Longitude,
                p.AmenitiesJson,
                p.ViewCount,
                p.ListedAt,
                Agent = new { p.Agent!.Name, p.Agent.Email, p.Agent.Phone, p.Agent.Agency }
            }).ToListAsync();

            return Ok(results);
        }

        // GET /api/properties/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var property = await _context.Properties
                .Include(p => p.Agent)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (property is null)
                return NotFound();

            // Increment view count
            property.ViewCount++;
            await _context.SaveChangesAsync();

            return Ok(property);
        }

        // POST /api/properties
        [HttpPost]
        public async Task<IActionResult> Create(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = property.Id }, property);
        }

        // PUT /api/properties/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Property updated)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property is null) return NotFound();

            property.Title         = updated.Title;
            property.Description   = updated.Description;
            property.Type          = updated.Type;
            property.Status        = updated.Status;
            property.Price         = updated.Price;
            property.Bedrooms      = updated.Bedrooms;
            property.Bathrooms     = updated.Bathrooms;
            property.AreaSqFt      = updated.AreaSqFt;
            property.Address       = updated.Address;
            property.City          = updated.City;
            property.Locality      = updated.Locality;
            property.Latitude      = updated.Latitude;
            property.Longitude     = updated.Longitude;
            property.AmenitiesJson = updated.AmenitiesJson;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/properties/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property is null) return NotFound();

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}