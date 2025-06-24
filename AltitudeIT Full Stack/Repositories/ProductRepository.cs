using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.Enums;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AltitudeIT_Full_Stack.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;
        public ProductRepository(ApplicationDbContext context)
        {
            _context= context;
        }
        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            var products = await _context.Products.OrderBy(p => p.Name).ToListAsync();
            return products;
        }
        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _context.Products.FindAsync(id);

        }
        public async Task<Product> CreateProductAsync(Product product)
        {
            var transaction = _context.Database.BeginTransaction();
            try
            {
                _context.Add(product);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return product;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Product> UpdateProductAsync(Product product)
        {
            var transaction = _context.Database.BeginTransaction();
            try
            {
                _context.Products.Update(product);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return product;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> DeleteProductAsync(int id)
        {
            var transaction = _context.Database.BeginTransaction();
            try
            {
                var product = await GetProductByIdAsync(id);
                if (product == null)
                {
                    await transaction.RollbackAsync();
                    return false;
                }
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(Category category)
        {
            var products = await _context.Products
                .Where(p=>p.Category == category)
                .OrderBy(p=>p.Name).ToListAsync();
            return products;
        }
    }
}
