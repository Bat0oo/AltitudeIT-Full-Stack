using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.Models;
using Microsoft.EntityFrameworkCore;

namespace AltitudeIT_Full_Stack.Seed
{
    public static class DbSeed
    {
        public static async Task SeedAdminAsync(ApplicationDbContext context, IConfiguration config)
        {
            var adminEmail = config["AdminCredentials:Email"];
            var password = config["AdminCredentials:Password"];

            var adminExists = await context.Users.AnyAsync(u => u.Email == adminEmail);
            if (adminExists)
                return;

            var admin = new User
            {
                FirstName = "Admin",
                LastName = "User",
                Email = adminEmail,
                Password = BCrypt.Net.BCrypt.HashPassword(password),
                Role = Enums.Role.Admin,
            };

            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}
