using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTickets.Data;
using SupportTickets.DTOs;
using SupportTickets.Models;
using System.Security.Claims;

namespace SupportTickets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TicketsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
    {
        var query = _db.Tickets.Include(t => t.User).AsQueryable();

        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            query = query.Where(t => t.UserId == userId);
        }

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(t => t.Title.Contains(search) || t.Description.Contains(search));

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketResponseDto(
                t.Id, t.Title, t.Description,
                t.Status, t.Priority, t.CreatedAt, t.User.Name))
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ticket = await _db.Tickets.Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return NotFound();

        return Ok(new TicketResponseDto(
            ticket.Id, ticket.Title, ticket.Description,
            ticket.Status, ticket.Priority, ticket.CreatedAt, ticket.User.Name));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTicketDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            UserId = userId
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();
        return Created($"/api/tickets/{ticket.Id}", ticket);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateTicketStatusDto dto)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        ticket.Status = dto.Status;
        ticket.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ticket);
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStats()
    {
        var stats = new
        {
            Total = await _db.Tickets.CountAsync(),
            Open = await _db.Tickets.CountAsync(t => t.Status == "Open"),
            InProgress = await _db.Tickets.CountAsync(t => t.Status == "InProgress"),
            Resolved = await _db.Tickets.CountAsync(t => t.Status == "Resolved"),
            Closed = await _db.Tickets.CountAsync(t => t.Status == "Closed")
        };
        return Ok(stats);
    }
}