using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Enums;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        public ProductsController(IProductService productService)
        {
            _productService = productService;
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
      //  [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductResponseDTO>> CreateProduct([FromBody] ProductCreateRequestDTO request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var product = await _productService.CreateProductAsync(request);
                return CreatedAtAction(nameof(GetProductById), new {id=product.Id}, product);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while creating product", error = ex.Message });
            }
        }
        [HttpPut]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult<ProductResponseDTO>> UpdateProduct(int id, [FromBody] ProductUpdateRequestDTO request)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }
            try
            {
                var product= await _productService.UpdateProductAsync(id, request);
                if(product == null)
                {
                    return NotFound(new { message = "Product was not found" });
                }
                return Ok(product);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Errow while updating product.", error = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
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
