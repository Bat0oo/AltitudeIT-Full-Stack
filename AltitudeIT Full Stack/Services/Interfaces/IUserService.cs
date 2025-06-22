using AltitudeIT_Full_Stack.DTO;

namespace AltitudeIT_Full_Stack.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync();
        Task<UserResponseDTO?> GetUserByIdAsync(int id);
        Task<UserResponseDTO> CreateUserAsync(RegisterRequestDTO request, string? imagePath = null);
        Task<UserResponseDTO?> UpdateUserAsync(int id, UserUpdateRequestDTO request, string? imagePath = null);
        Task<bool> DeleteUserAsync(int id);
    }
}
