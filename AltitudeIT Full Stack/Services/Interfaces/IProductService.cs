using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Enums;

namespace AltitudeIT_Full_Stack.Services.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductResponseDTO>> GetAllProductsAsync();
        Task<ProductResponseDTO?> GetProductByIdAsync(int id);
        Task<IEnumerable<ProductResponseDTO>> GetProductsByCategoryAsync(Category category);
        Task<ProductResponseDTO> CreateProductAsync(ProductCreateRequestDTO request, string? imagePath = null);
        Task<ProductResponseDTO?> UpdateProductAsync(int id, ProductUpdateRequestDTO request, string? imagePath = null);
        Task<bool> DeleteProductAsync(int id);

    }
}
