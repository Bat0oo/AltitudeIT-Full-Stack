using AltitudeIT_Full_Stack.Models;

namespace AltitudeIT_Full_Stack.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        int? GetUserIdFromToken(string token);
        string? GetUserRoleFromToken(string token);
        bool ValidateToken(string token);
    }
}
