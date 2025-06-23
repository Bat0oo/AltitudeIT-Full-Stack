using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Enums;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IWebHostEnvironment _environment;
        private readonly IImageService _imageService;
        private readonly ApplicationDbContext _applicationDbContext;
        public ProductsController(IProductService productService, IWebHostEnvironment environment, IImageService imageService, ApplicationDbContext applicationDbContext)
        {
            _productService = productService;
            _applicationDbContext = applicationDbContext;
            _environment = environment;
            _imageService = imageService;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponseDTO>>> GetProducts()
        {
            try
            {
                var products = await _productService.GetAllProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while getting all products.", error = ex.Message });
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponseDTO>> GetProductById(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found." });
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while getting product by id,", error = ex.Message });
            }
        }
        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<ProductResponseDTO>>> GetProductsByCategory(Category category)
        {
            try
            {
                var products = await _productService.GetProductsByCategoryAsync(category);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while getting products by category", error = ex.Message });
            }
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductResponseDTO>> CreateProduct([FromForm] ProductCreateRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            try
            {
                var imagePath = await _imageService.SaveProductImageAsync(request.Image, 0); //provjeru vratit
                var product = await _productService.CreateProductAsync(request, imagePath);
                if (request.Image != null)
                {
                    product.Image = imagePath;
                    await _applicationDbContext.SaveChangesAsync();
                }

                return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine("slika: "+request.Image.FileName);
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = "Error while creating product", error = innerMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while creating product", error = ex.Message });
            }
        }
        [HttpPut("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult<ProductResponseDTO>> UpdateProduct(int id, [FromForm] ProductUpdateRequestDTO request)
        {
            /*
            Console.WriteLine($"Updating product {id}");
            Console.WriteLine($"Image file received: {request.ImageFile?.FileName ?? "null"}");
            Console.WriteLine($"Request data: {JsonSerializer.Serialize(request)}");
            */
            // Add these debug lines at the very beginning
            Console.WriteLine("====================================================================================================");
            Console.WriteLine($"UPDATE REQUEST RECEIVED - Product ID: {id}");
            Console.WriteLine($"Request.ImageFile is null: {request.ImageFile == null}");
            Console.WriteLine($"Request.ImageFile filename: {request.ImageFile?.FileName ?? "NULL"}");
            Console.WriteLine($"Request.ImageFile size: {request.ImageFile?.Length ?? 0}");
            Console.WriteLine($"Request.ImageFile content type: {request.ImageFile?.ContentType ?? "NULL"}");
            Console.WriteLine("====================================================================================================");

            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState is invalid:");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"Key: {error.Key}, Errors: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState); 
            }
            try
            {
                var existingProduct = await _productService.GetProductByIdAsync(id);
                if (existingProduct == null)
                {
                    return NotFound(new { message = "Product not found" });
                }
                string newImagePath = existingProduct.Image;
                Console.WriteLine("====================================================================================================");
                Console.WriteLine("TEST 4 - Existing image path: " + newImagePath);

                Console.WriteLine($"About to check image file - ImageFile null: {request.ImageFile == null}");

                if (request.ImageFile != null)
                {
                    Console.WriteLine("ImageFile is not null, checking if valid...");
                    bool isValid = _imageService.IsValidImage(request.ImageFile);
                    Console.WriteLine($"Image validation result: {isValid}");

                    if (isValid)
                    {
                        Console.WriteLine("Image is valid, proceeding with image processing...");
                        if (!string.IsNullOrEmpty(existingProduct.Image))
                        {
                            Console.WriteLine($"Deleting existing image: {existingProduct.Image}");
                            await _imageService.DeleteImageAsync(existingProduct.Image);
                        }

                        newImagePath = await _imageService.SaveProductImageAsync(request.ImageFile, id);
                        Console.WriteLine("====================================================================================================");
                        Console.WriteLine("test1");
                        Console.WriteLine($"New product image saved: {newImagePath}");
                    }
                    else
                    {
                        Console.WriteLine("Image validation failed!");
                    }
                }
                else
                {
                    Console.WriteLine("ImageFile is null - no image to process");
                }

                var updatedProduct = await _productService.UpdateProductAsync(id, request, newImagePath);
                Console.WriteLine("====================================================================================================");
                Console.WriteLine("TEST UPDATED: " + updatedProduct.Image);
                await _applicationDbContext.SaveChangesAsync();

                return Ok(new {success=true, data=updatedProduct});
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in UpdateProduct: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Errow while updating product.", error = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product != null && !string.IsNullOrEmpty(product.Image))
                {
                    await _imageService.DeleteImageAsync(product.Image);
                }

                var deleted = await _productService.DeleteProductAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Product not found" });
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while deleting product", error = ex.Message });
            }
        }
    }
}
