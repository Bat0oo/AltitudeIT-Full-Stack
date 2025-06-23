using AltitudeIT_Full_Stack.Enums;
using System.ComponentModel.DataAnnotations;

namespace AltitudeIT_Full_Stack.DTO
{
    public class ProductCreateRequestDTO
    {
        [Required(ErrorMessage = "Product name is required.")]
        [StringLength(100, ErrorMessage = "Product name cannot be longer than 100 characters.")]
        public string Name { get; set; } = string.Empty;
        [Required(ErrorMessage = "Product category is required.")]
        public Category Category { get; set; }
        [Required(ErrorMessage = "Product price is required.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero.")]
        [DataType(DataType.Currency)]
        public double Price { get; set; }
        [Required(ErrorMessage = "Product image is required.")]
        public IFormFile? Image { get; set; } 

    }
}
