using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Enums;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using AltitudeIT_Full_Stack.Services.Interfaces;

namespace AltitudeIT_Full_Stack.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ApplicationDbContext _context;
        public ProductService(IProductRepository productRepository, ApplicationDbContext context)
        {
            _productRepository = productRepository;
            _context = context;
        }

        public async Task<IEnumerable<ProductResponseDTO>> GetAllProductsAsync()
        {
            var products = await _productRepository.GetAllProductsAsync();
            return products.Select(MapToResponseDTO);
        }
        public async Task<ProductResponseDTO?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetProductByIdAsync(id);
            if (product == null)
            {
                return null;
            }
            else
            {
                return MapToResponseDTO(product);
            }
        }
        public async Task<IEnumerable<ProductResponseDTO>> GetProductsByCategoryAsync(Category category)
        {
            var products = await _productRepository.GetProductsByCategoryAsync(category);
            return products.Select(MapToResponseDTO);
        }
        public async Task<ProductResponseDTO> CreateProductAsync(ProductCreateRequestDTO request)
        {
            var product=new Product
            {
                Name = request.Name,
                Category = request.Category,
                Price = request.Price,
                Image = request.Image
            };
            var createdProduct = await _productRepository.CreateProductAsync(product);
            return MapToResponseDTO(createdProduct);
        }
        public async Task<ProductResponseDTO?> UpdateProductAsync(int id, ProductUpdateRequestDTO request)
        {
            var productToUpdate = await _productRepository.GetProductByIdAsync(id);
            if(productToUpdate == null)
            {
                return null;
            }
            productToUpdate.Name= request.Name;
            productToUpdate.Category= request.Category;
            productToUpdate.Price= request.Price;
            productToUpdate.Image= request.Image;

            var updatedProduct = await _productRepository.UpdateProductAsync(productToUpdate);
            return MapToResponseDTO(updatedProduct);
        }
        public Task<bool> DeleteProductAsync(int id)
        {
            return _productRepository.DeleteProductAsync(id);
        }

        private static ProductResponseDTO MapToResponseDTO(Product product)
        {
            return new ProductResponseDTO
            {
                Id = product.Id,
                Name = product.Name,
                Category = product.Category,
                CategoryName = product.Category.ToString(),
                Price = product.Price,
                Image = product.Image
            };
        }

    }
}
