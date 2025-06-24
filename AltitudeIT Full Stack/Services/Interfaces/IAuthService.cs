using AltitudeIT_Full_Stack.DTO;

namespace AltitudeIT_Full_Stack.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDTO?> LoginAsync(LoginRequestDTO request);
        Task<UserResponseDTO> RegisterAsync(RegisterRequestDTO request, string? imagePath = null);
        Task<UserResponseDTO?> GetCurrentUserAsync(int userId);
    }
}
