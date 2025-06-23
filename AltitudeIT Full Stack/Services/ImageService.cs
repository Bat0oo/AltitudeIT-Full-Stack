using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Services.Interfaces;

namespace AltitudeIT_Full_Stack.Services
{
    public class ImageService : IImageService
    {
        private readonly ILogger<ImageService> _logger;
        private const string UploadsPath = "/app/uploads"; // Docker volume path
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

        public ImageService(ILogger<ImageService> logger)
        {
            _logger = logger;
        }

        public bool IsValidImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            // Check file size
            if (file.Length > MaxFileSize)
                return false;

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

            // Check MIME type
            var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        public async Task<string> SaveImageAsync(IFormFile file, int userId)
        {
            try
            {
                var profilesPath = Path.Combine(UploadsPath, "profiles");

                // Ensure directory exists
                if (!Directory.Exists(profilesPath))
                {
                    Directory.CreateDirectory(profilesPath);
                }

                // Generate unique filename
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                //var fileName = $"user_{userId}_{Guid.NewGuid()}{extension}";
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(profilesPath, fileName);

                // Save file to Docker volume
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"Image saved successfully: {filePath}");


                return $"/api/uploads/profiles/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving image for user {UserId}", userId);
                throw new InvalidOperationException("Failed to save image", ex);
            }
        }

        public async Task<bool> DeleteImageAsync(string imagePath)
        {
            try
            {
                if (string.IsNullOrEmpty(imagePath))
                    return false;

                // Extract filename from path (handle both relative and API endpoint paths)
                var fileName = imagePath.Contains("images/")
                    ? imagePath.Split("images/").Last()
                    : Path.GetFileName(imagePath);

                var fullPath = Path.Combine(UploadsPath, "profiles", fileName);
                var fullPathProduct = Path.Combine(UploadsPath, "products", fileName);

                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    _logger.LogInformation($"Image deleted successfully: {fullPath}");
                    return true;
                }else if(File.Exists(fullPathProduct))
                {
                    File.Delete(fullPathProduct);
                    _logger.LogInformation($"Image deleted succesfully: {fullPathProduct}");
                    return true; 
                }

                    return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image: {ImagePath}", imagePath);
                return false;
            }
        }

        public async Task<string> SaveProductImageAsync(IFormFile file, int productId)
        {
            try
            {
                var productsPath = Path.Combine(UploadsPath, "products");

                // Ensure directory exists
                if (!Directory.Exists(productsPath))
                {
                    Directory.CreateDirectory(productsPath);
                }

                // Generate unique filename
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(productsPath, fileName);

                // Save file to Docker volume
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"Product image saved successfully: {filePath}");

                // Return relative path for API endpoint (for future products controller)
                return $"/api/uploads/products/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving product image for product {ProductId}", productId);
                throw new InvalidOperationException("Failed to save product image", ex);
            }
        }
    }
}
