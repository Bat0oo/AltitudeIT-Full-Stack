using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using AltitudeIT_Full_Stack.Services.Interfaces;

namespace AltitudeIT_Full_Stack.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public AuthService(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }
        public async Task<UserResponseDTO> RegisterAsync(RegisterRequestDTO request)
        {

            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException("User with that email already exists.");
            }

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Role = request.Role,
                ContactNumber = request.ContactNumber,
                Image = request.Image,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            var createdUser = await _userRepository.CreateUserAsync(user);
            return MapToResponseDTO(createdUser);
        }
        public async Task<LoginResponseDTO?> LoginAsync(LoginRequestDTO request)
        {
            var user = await _userRepository.GetUserByEmailAsync(request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return null;
            }

            var token = _jwtService.GenerateToken(user);
            var expiresAt = DateTime.UtcNow.AddMinutes(60);

            return new LoginResponseDTO
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToResponseDTO(user)
            };
        }

        public async Task<UserResponseDTO?> GetCurrentUserAsync(int userId)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return null;
            }
            return MapToResponseDTO(user);
        }
        private static UserResponseDTO MapToResponseDTO(User user)
        {
            return new UserResponseDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                ContactNumber = user.ContactNumber,
                Image = user.Image
            };
        }

    }
}
