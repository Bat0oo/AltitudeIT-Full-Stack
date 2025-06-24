namespace AltitudeIT_Full_Stack.DTO
{
    public class AnalyticsResponseDTO
    {
        public int TotalProducts { get; set; }
        public int TotalUsers { get; set; }
        public List<CategoryPerformanceDTO> CategoryPerformance { get; set; } = new();
        public List<PriceDistributionDTO> PriceDistribution { get; set; } = new();
    }
    public class CategoryPerformanceDTO
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class PriceDistributionDTO
    {
        public string Range { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
