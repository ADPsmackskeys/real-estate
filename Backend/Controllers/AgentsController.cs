using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AgentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/agents
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var agents = await _context.Agents
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Email,
                    a.Phone,
                    a.Agency,
                    a.Bio,
                    ListingCount = a.Properties.Count
                })
                .ToListAsync();

            return Ok(agents);
        }

        // GET /api/agents/{id}
        // Returns agent details + their active listings
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var agent = await _context.Agents
                .Include(a => a.Properties)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agent is null) return NotFound();

            var result = new
            {
                agent.Id,
                agent.Name,
                agent.Email,
                agent.Phone,
                agent.Agency,
                agent.Bio,
                Properties = agent.Properties.Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Type,
                    p.Status,
                    p.Price,
                    p.City,
                    p.Locality,
                    p.Bedrooms,
                    p.Bathrooms,
                    p.AreaSqFt
                })
            };

            return Ok(result);
        }

        // POST /api/agents
        [HttpPost]
        public async Task<IActionResult> Create(Agent agent)
        {
            var emailTaken = await _context.Agents.AnyAsync(a => a.Email == agent.Email);
            if (emailTaken) return Conflict("An agent with this email already exists.");

            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = agent.Id }, agent);
        }

        // PUT /api/agents/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Agent updated)
        {
            var agent = await _context.Agents.FindAsync(id);
            if (agent is null) return NotFound();

            agent.Name   = updated.Name;
            agent.Email  = updated.Email;
            agent.Phone  = updated.Phone;
            agent.Agency = updated.Agency;
            agent.Bio    = updated.Bio;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/agents/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var agent = await _context.Agents.FindAsync(id);
            if (agent is null) return NotFound();

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}