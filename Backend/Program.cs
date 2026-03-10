using Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── API + Swagger ─────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── CORS for React ────────────────────────────────────
builder.Services.AddCors(options =>
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// ── Middleware ────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ReactApp");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// ── DB Test Endpoint ──────────────────────────────────
app.MapGet("/test-db", async (AppDbContext db) =>
{
    var count = await db.Properties.CountAsync();
    return Results.Ok(new { message = "DB Connected!", propertyCount = count });
});

app.Run();