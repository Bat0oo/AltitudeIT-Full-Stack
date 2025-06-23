using AltitudeIT_Full_Stack.Models;

namespace AltitudeIT_Full_Stack.Services.Interfaces
{
    public interface IImageService
    {
        bool IsValidImage(IFormFile file);
        Task<string> SaveImageAsync(IFormFile file, int userId);
        Task<bool> DeleteImageAsync(string imagePath);
        Task<string> SaveProductImageAsync(IFormFile file, int productId);
    }
}
