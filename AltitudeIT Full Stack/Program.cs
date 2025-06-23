
using AltitudeIT_Full_Stack.Data;
using AltitudeIT_Full_Stack.Models;
using AltitudeIT_Full_Stack.Repositories;
using AltitudeIT_Full_Stack.Repositories.Interfaces;
using AltitudeIT_Full_Stack.Services;
using AltitudeIT_Full_Stack.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace AltitudeIT_Full_Stack
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                    {
                        var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = jwtSettings!.Issuer,
                            ValidAudience = jwtSettings.Audience,
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
                            ClockSkew = TimeSpan.Zero
                        };
                    });
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy =>
                    {
                        policy.WithOrigins(
                        "http://localhost:3000",    // React dev server
                        "http://localhost:8080",    // Docker frontend
                        "https://localhost:3000",   // HTTPS React dev server
                        "https://localhost:8080",   // HTTPS Docker frontend
                        "http://localhost:5055",    // Local backend HTTP
                        "https://localhost:7280"    // Local backend HTTPS
                    )
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
            });

            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();

            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<IProductService, ProductService>();

            builder.Services.AddScoped<IAuthService, AuthService>();

            builder.Services.AddScoped<IJwtService, JwtService>();

            builder.Services.AddScoped<IImageService, ImageService>();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            //    context.Database.Migrate();
            }

            //app.UseStaticFiles();
            var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider("/app/uploads"),
                RequestPath = "/api/uploads" ,
                OnPrepareResponse = ctx =>
                {
                    // Optional: Add cache headers
                    ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=600");
                }
            });

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowFrontend");

            app.UseHttpsRedirection();
            app.UseAuthentication();

            app.UseAuthorization();


            app.MapControllers();

            var uploadsDir = "/app/uploads/profiles";
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }
            var uploadsDirProd = "/app/uploads/products";
            if (!Directory.Exists(uploadsDirProd))
            {
                Directory.CreateDirectory(uploadsDirProd);
            }

            app.Run();
        }
    }
}
