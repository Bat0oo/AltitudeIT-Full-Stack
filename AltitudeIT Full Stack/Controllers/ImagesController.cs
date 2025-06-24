using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private const string UploadsPath = "/app/uploads";
        private readonly ILogger<ImagesController> _logger;

        public ImagesController(ILogger<ImagesController> logger)
        {
            _logger = logger;
        }

        [HttpGet("uploads/profiles/{fileName}")]
        public async Task<IActionResult> GetProfileImage(string fileName)
        {
            try
            {
                var filePath = Path.Combine(UploadsPath, "profiles", fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning($"Profile image not found: {filePath}");
                    return NotFound("Image not found");
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving profile image: {FileName}", fileName);
                return StatusCode(500, "Error retrieving image");
            }
        }

        [HttpGet("uploads/products/{fileName}")]
        public async Task<IActionResult> GetProductImage(string fileName)
        {
            try
            {
                var filePath = Path.Combine(UploadsPath, "products", fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning($"Product image not found: {filePath}");
                    return NotFound("Image not found");
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product image: {FileName}", fileName);
                return StatusCode(500, "Error retrieving image");
            }
        }

        [HttpGet("users/images/{fileName}")]
        public async Task<IActionResult> GetUserImage(string fileName)
        {
            return await GetProfileImage(fileName);
        }

        [HttpGet("products/images/{fileName}")]
        public async Task<IActionResult> GetProductImageAlt(string fileName)
        {
            return await GetProductImage(fileName);
        }

        private static string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }
    }
}
