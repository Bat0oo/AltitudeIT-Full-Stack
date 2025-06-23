using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using AltitudeIT_Full_Stack.Services.Interfaces;

namespace AltitudeIT_Full_Stack.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IImageService _imageService;
        public UserService(IUserRepository userRepository, IImageService imageService)
        {
            _userRepository = userRepository;
            _imageService = imageService;
        }
        public async Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return users.Select(MapToResponseDTO);
        }
        public async Task<UserResponseDTO?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if(user == null)
            {
                return null;
            }
            else
            {
                return MapToResponseDTO(user);
            }
        }
        public async Task<UserResponseDTO> CreateUserAsync(RegisterRequestDTO request, string? imagePath = null)
        {
            if(await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new Exception("User with that email already exists.");
            }
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Role = request.Role,
                ContactNumber = request.ContactNumber,
                Image = imagePath,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)

            };
            var createdUser= await _userRepository.CreateUserAsync(user);
            return MapToResponseDTO(createdUser);
        }
        public async Task<UserResponseDTO?> UpdateUserAsync(int id, UserUpdateRequestDTO request, string? imagePath = null)
        {
            var userToUpdate= await _userRepository.GetUserByIdAsync(id);
            if(userToUpdate == null)
            {
                return null;
            }
            if(await _userRepository.EmailExistsAsync(request.Email, id))
            {
                throw new Exception("User with that email already exists");
            }
            userToUpdate.FirstName = request.FirstName;
            userToUpdate.LastName = request.LastName;
            userToUpdate.Email = request.Email;
            userToUpdate.Role = request.Role;
            //userToUpdate.Image= request.Image;
            userToUpdate.ContactNumber = request.ContactNumber;

            if (!string.IsNullOrEmpty(request.Password))
            {
                userToUpdate.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            if (!string.IsNullOrEmpty(imagePath))
            {
                userToUpdate.Image = imagePath;
            }
            else if (imagePath == null && request.ImageFile == null)
            {
                userToUpdate.Image = null;
            }


            var updatedUser = await _userRepository.UpdateUserAsync(userToUpdate);
            return MapToResponseDTO(updatedUser);
        }
        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
                return false;

            if (!string.IsNullOrEmpty(user.Image))
            {
                try
                {
                    await _imageService.DeleteImageAsync(user.Image);
                }
                catch { 
 
                }
            }

            return await _userRepository.DeleteUserAsync(id);

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
