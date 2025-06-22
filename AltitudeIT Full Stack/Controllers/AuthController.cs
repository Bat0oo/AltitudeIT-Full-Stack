using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IWebHostEnvironment _environment;
        public AuthController(IAuthService authService, IWebHostEnvironment environment)
        {
            _authService = authService;
            _environment = environment;
        }
        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDTO>> Register([FromForm] RegisterRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string? imagePath = null;
                if (request.Image != null)
                {
                    imagePath = await SaveImageAsync(request.Image);
                }

                var user = await _authService.RegisterAsync(request, imagePath);
                return CreatedAtAction(nameof(GetCurrentUser), null, user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromForm] LoginRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.LoginAsync(request);

                if (result == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponseDTO>> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _authService.GetCurrentUserAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving user information", error = ex.Message });
            }
        }
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "CORS is working!" });
        }

        private async Task<string> SaveImageAsync(IFormFile image)
        {
            try
            {
                var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "profiles");
                Directory.CreateDirectory(uploadsPath);

                var fileExtension = Path.GetExtension(image.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }
                return $"/uploads/profiles/{fileName}";
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to save image: {ex.Message}");
            }
        }
        }
}
