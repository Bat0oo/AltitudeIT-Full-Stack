using AltitudeIT_Full_Stack.Enums;

namespace AltitudeIT_Full_Stack.DTO
{
    public class ProductResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Category Category { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public double Price { get; set; }
        public string Image { get; set; } = string.Empty;
    }
}
