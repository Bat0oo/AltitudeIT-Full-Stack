using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AltitudeIT_Full_Stack.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        public UserRepository(ApplicationDbContext context) {  _context = context; }
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }
        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
        public async Task<User> CreateUserAsync(User user)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<User> UpdateUserAsync(User user)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> DeleteUserAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await GetUserByIdAsync(id);
                if (user == null) 
                { 
                    return false; 
                }
                _context.Users.Remove(user);
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

        public async Task<bool> EmailExistsAsync(string email, int? excludeCurrentUserId = null)
        {
            var query= _context.Users.Where(u => u.Email == email);
            if (excludeCurrentUserId.HasValue)
                query = query.Where(u => u.Id != excludeCurrentUserId.Value); //because admin also can update users, also user doesn't need to change it
            return await query.AnyAsync();
        }


    }
}
