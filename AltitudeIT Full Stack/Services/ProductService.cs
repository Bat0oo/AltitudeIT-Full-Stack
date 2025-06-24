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
        private readonly IImageService _imageService;
        private readonly ApplicationDbContext _context;
        public ProductService(IProductRepository productRepository, ApplicationDbContext context, IImageService imageService)
        {
            _productRepository = productRepository;
            _context = context;
            _imageService = imageService;
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
        public async Task<ProductResponseDTO> CreateProductAsync(ProductCreateRequestDTO request, string? imagePath = null)
        {
            var product=new Product
            {
                Name = request.Name,
                Category = request.Category,
                Price = request.Price,
                Image = imagePath
            };
            var createdProduct = await _productRepository.CreateProductAsync(product);
            return MapToResponseDTO(createdProduct);
        }
        public async Task<ProductResponseDTO?> UpdateProductAsync(int id, ProductUpdateRequestDTO request, string? imagePath = null)
        {
            var productToUpdate = await _productRepository.GetProductByIdAsync(id);
            if(productToUpdate == null)
            {
                return null;
            }
            productToUpdate.Name= request.Name;
            productToUpdate.Category= request.Category;
            productToUpdate.Price= request.Price;
            Console.WriteLine("test1" + request.Image);
            
            //productToUpdate.Image= request.Image;
            if (!string.IsNullOrEmpty(imagePath))
            {
                productToUpdate.Image = imagePath;
                Console.WriteLine("test2"+productToUpdate.Image);
            }
            else if (imagePath == null && request.ImageFile == null)
            {
                productToUpdate.Image = null;
            }

            var updatedProduct = await _productRepository.UpdateProductAsync(productToUpdate);
            return MapToResponseDTO(updatedProduct);
        }
        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetProductByIdAsync(id);
            if (product == null)
                return false;

            if (!string.IsNullOrEmpty(product.Image))
            {
                try
                {
                    await _imageService.DeleteImageAsync(product.Image);
                }
                catch
                {
                    
                }
            }
            return await _productRepository.DeleteProductAsync(id);
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
