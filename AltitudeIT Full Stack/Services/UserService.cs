using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using AltitudeIT_Full_Stack.Services.Interfaces;

namespace AltitudeIT_Full_Stack.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
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
        public async Task<UserResponseDTO> CreateUserAsync(RegisterRequestDTO request)
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
                Image = request.Image,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)

            };
            var createdUser= await _userRepository.CreateUserAsync(user);
            return MapToResponseDTO(createdUser);
        }
        public async Task<UserResponseDTO?> UpdateUserAsync(int id, UserUpdateRequestDTO request)
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
            userToUpdate.Image= request.Image;
            userToUpdate.ContactNumber = request.ContactNumber;

            if(!string.IsNullOrEmpty(request.Password))
            {
                userToUpdate.Password=BCrypt.Net.BCrypt.HashPassword(request.Password);
            }
            var updatedUser = await _userRepository.UpdateUserAsync(userToUpdate);
            return MapToResponseDTO(updatedUser);
        }
        public async Task<bool> DeleteUserAsync(int id)
        {
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
