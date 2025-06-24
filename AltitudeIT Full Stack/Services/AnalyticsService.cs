using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.DTO;
using AltitudeIT_Full_Stack.Enums;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AltitudeIT_Full_Stack.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserService _userService;
        private readonly IProductService _productService;
        public AnalyticsService(ApplicationDbContext context, IUserService userService, IProductService productService)
        {
            _context = context;
            _userService = userService;
            _productService = productService;
        }

        public async Task<AnalyticsResponseDTO> GetAnalyticsDataAsync()
        {
            var products = await _context.Products.ToListAsync();
            var users = await _userService.GetAllUsersAsync();
  

            var analytics = new AnalyticsResponseDTO
            {
                TotalProducts = products.Count(),
                TotalUsers = users.Count(),
                CategoryPerformance = GetCategoryPerformance(products.ToList()),
                PriceDistribution = GetPriceDistribution(products)
            };

            return analytics;
        }
        private List<CategoryPerformanceDTO> GetCategoryPerformance(List<Models.Product> products)
        {
            if (!products.Any()) return new List<CategoryPerformanceDTO>();

            var totalCount = products.Count;
            var categoryGroups = products
                .GroupBy(p => p.Category)
                .Select(g => new CategoryPerformanceDTO
                {
                    Category = GetCategoryName(g.Key),
                    Count = g.Count(),
                    Percentage = Math.Round((decimal)g.Count() / totalCount * 100, 1)
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            return categoryGroups;
        }

        private List<PriceDistributionDTO> GetPriceDistribution(List<Models.Product> products)
        {
            if (!products.Any()) return new List<PriceDistributionDTO>();

            var priceRanges = new Dictionary<string, int>
            {
                ["Less than $100"] = 0,
                ["$100-500"] = 0,
                ["$500-1000"] = 0,
                ["Over $1000"] = 0
            };

            foreach (var product in products)
            {
                var price = product.Price;
                if (price < 100.0)
                {
                    priceRanges["Less than $100"]++;
                }
                else if (price >= 100.0 && price < 500.0)
                {
                    priceRanges["$100-500"]++;
                }
                else if (price >= 500.0 && price < 1000.0)
                {
                    priceRanges["$500-1000"]++;
                }
                else
                {
                    priceRanges["Over $1000"]++;
                }
            }

            return priceRanges.Select(kvp => new PriceDistributionDTO
            {
                Range = kvp.Key,
                Count = kvp.Value
            }).ToList();
        }

        private string GetCategoryName(Category category)
        {
            return category switch
            {
                Category.Tablets => "Tablets",
                Category.Smartphones => "Smartphones",
                Category.Laptops => "Laptops",
                Category.Cameras => "Cameras",
                Category.Gaming => "Gaming",
                Category.Audio => "Audio",
                Category.Wearables => "Wearables",
                Category.Accessories => "Accessories",
                _ => "Unknown"
            };
        }
    }
}