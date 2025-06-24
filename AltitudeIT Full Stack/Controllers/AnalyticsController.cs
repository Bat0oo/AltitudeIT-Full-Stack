using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AltitudeIT_Full_Stack.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet]
        public async Task<ActionResult<AnalyticsResponseDTO>> GetAnalytics()
        {
            try
            {
                var analytics = await _analyticsService.GetAnalyticsDataAsync();
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while getting analytics data.", error = ex.Message });
            }
        }
    }
}
