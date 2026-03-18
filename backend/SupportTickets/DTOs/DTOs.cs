namespace SupportTickets.DTOs;

public record RegisterDto(string Name, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Name, string Role);

public record CreateTicketDto(string Title, string Description, string Priority);
public record UpdateTicketStatusDto(string Status);

public record TicketResponseDto(
    int Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    DateTime CreatedAt,
    string CreatedBy
);
 