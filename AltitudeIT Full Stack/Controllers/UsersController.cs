using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly Data.ApplicationDbContext _context;
        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        [Authorize(Roles="Admin")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Select(u=>new UserResponseDTO
            {
                Id= u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                ContactNumber = u.ContactNumber,
                Image = u.Image
            }).ToListAsync();
            return Ok(users);
        }
        [HttpGet("{id}") ]
        public async Task<IActionResult> GetUserByID(int id) {

            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }

            var userResponseDTO = new UserResponseDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                ContactNumber = user.ContactNumber,
                Image = user.Image
            };
            return Ok(userResponseDTO); 
        }
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] RegisterRequestDTO request)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "User with this email already exists" });
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

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userResponse = new UserResponseDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                ContactNumber = user.ContactNumber,
                Image = user.Image
            };

            return CreatedAtAction(nameof(GetUserByID), new { id = user.Id }, userResponse);

        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userToUpdate = await _context.Users.FindAsync(id);
            if (userToUpdate == null)
            {
                return NotFound();
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id !=id))
            {
                return BadRequest(new { message = "Email is already taken." });
            }

            userToUpdate.FirstName = request.FirstName;
            userToUpdate.LastName = request.LastName;
            userToUpdate.Email = request.Email;
            userToUpdate.ContactNumber= request.ContactNumber;
            userToUpdate.Image = request.Image;
            if(!string.IsNullOrEmpty(userToUpdate.Password))
            {
                userToUpdate.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }
            await _context.SaveChangesAsync();

            var userResponse = new UserResponseDTO
            {
                Id = userToUpdate.Id,
                FirstName = userToUpdate.FirstName,
                LastName = userToUpdate.LastName,
                Email = userToUpdate.Email,
                Image = userToUpdate.Image,
                Role = userToUpdate.Role
            };
            return Ok(userResponse);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            _context.Users.Remove(user);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
