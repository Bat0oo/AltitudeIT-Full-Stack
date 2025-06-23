using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _environment;
        private readonly IImageService _imageService;
        private readonly ApplicationDbContext _applicationDbContext;
        public UsersController(IUserService userService, IWebHostEnvironment environment, IImageService imageService, ApplicationDbContext context)
        {
            _userService = userService;
            _environment = environment;
            _imageService = imageService;
            _applicationDbContext = context;
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error while retrieving users", error = ex.Message });
            }
        }
        [HttpGet("{id}")]
        //[Authorize]
        public async Task<ActionResult<UserResponseDTO>> GetUserById(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = $"User with {id} not found" });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the user by id", error = ex.Message });
            }
        }
        [HttpPost]
        public async Task<ActionResult<UserResponseDTO>> CreateUser([FromForm] RegisterRequestDTO request) //[fromform] [formbody]
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var user = await _userService.CreateUserAsync(request);
                if (request.Image != null && _imageService.IsValidImage(request.Image))
                {
                    var imagePath = await _imageService.SaveImageAsync(request.Image, user.Id);
                    user.Image = imagePath;
                    await _applicationDbContext.SaveChangesAsync();
                }
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the user", error = ex.Message });
            }
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDTO>> UpdateUser(int id, [FromForm] UserUpdateRequestDTO request)
        {
            Console.WriteLine($"Updating user {id}");
            Console.WriteLine($"Image file received: {request.ImageFile?.FileName ?? "null"}");
            Console.WriteLine($"Request data: {JsonSerializer.Serialize(request)}");
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                // var user = await _userService.UpdateUserAsync(id, request);
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                string newImagePath = existingUser.Image; 
                
                if (request.ImageFile != null && _imageService.IsValidImage(request.ImageFile))
                {
                    if (!string.IsNullOrEmpty(existingUser.Image))
                    {
                        await _imageService.DeleteImageAsync(existingUser.Image);
                    }

                    newImagePath = await _imageService.SaveImageAsync(request.ImageFile, id);
                    Console.WriteLine($"New image saved: {newImagePath}");

                }

                var updatedUser = await _userService.UpdateUserAsync(id, request, newImagePath);
                await _applicationDbContext.SaveChangesAsync();

                return Ok(new {success=true, data=updatedUser});
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception details: {ex}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                return StatusCode(500, new { message = "Error happened while updating user", error = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user != null && !string.IsNullOrEmpty(user.Image))
                {
                    await _imageService.DeleteImageAsync(user.Image);
                }

                bool deleted= await _userService.DeleteUserAsync(id);
                if (!deleted)
                {
                    return NotFound(new {message="User not found"});
                }
                return NoContent();
            }
            catch(Exception ex) 
            {
                return StatusCode(500, new {message = $"Error happened while trying to delete user with {id} id", error=ex.Message});
            }
        }
        public async Task<string> SaveImageAsync(IFormFile file)
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "profiles");

            // Ensure directory exists
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            var fileName = $"{Guid.NewGuid()}.jpg";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/profiles/{fileName}";
        }
        [HttpGet("images/{fileName}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetImage(string fileName)
        {
            try
            {
                var uploadsPath = Path.Combine("/app/uploads", "profiles"); // Docker volume path
                var filePath = Path.Combine(uploadsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Image not found" });
                }

                var imageBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var contentType = GetContentType(fileName);

                return File(imageBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving image", error = ex.Message });
            }
        }
        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }

    }
}
