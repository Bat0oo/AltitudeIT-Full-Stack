using AltitudeIT_Full_Stack.DTO;

namespace AltitudeIT_Full_Stack.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<AnalyticsResponseDTO> GetAnalyticsDataAsync();
    }
}
