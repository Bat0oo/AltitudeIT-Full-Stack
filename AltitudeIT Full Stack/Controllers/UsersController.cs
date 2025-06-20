using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        public UsersController(IUserService userService)
        {
            _userService = userService;
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
        public async Task<ActionResult<UserResponseDTO>> CreateUser([FromBody] RegisterRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var user = await _userService.CreateUserAsync(request);
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
        public async Task<ActionResult<UserResponseDTO>> UpdateUser(int id, [FromBody] UserUpdateRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var user = await _userService.UpdateUserAsync(id, request);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error happened while updating user", error = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
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
    }
}
