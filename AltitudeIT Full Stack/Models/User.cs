using AltitudeIT_Full_Stack.Enums;
using System.ComponentModel.DataAnnotations;

namespace AltitudeIT_Full_Stack.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(20, ErrorMessage = "First name cannot be longer than 20 characters.")]
        public string FirstName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(20, ErrorMessage = "Last name cannot be longer than 20 characters.")]
        public string LastName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [StringLength(50, ErrorMessage = "Email cannot be longer than 50 characters.")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, ErrorMessage = "Password must be between 6 and 100 characters.", MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
        [Required(ErrorMessage = "Role is required.")]
        public Role Role { get; set; }
        [Required(ErrorMessage = "Contact number is required.")]
        [DataType(DataType.PhoneNumber)]
        [RegularExpression(@"^\+?\d{10,15}$", ErrorMessage = "Invalid phone number.")]
        public string ContactNumber { get; set; } =string.Empty;
        [Required(ErrorMessage = "Image is required.")]
        [Url(ErrorMessage = "Invalid image URL.")]
        [StringLength(200, ErrorMessage = "Image URL cannot be longer than 200 characters.")]
        public string Image { get; set; } = string.Empty;

    }
}
