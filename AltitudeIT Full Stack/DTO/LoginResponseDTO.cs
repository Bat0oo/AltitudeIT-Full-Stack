namespace AltitudeIT_Full_Stack.DTO
{
    public class LoginResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public string TokenType { get; set; } = "Bearer";
        public DateTime ExpiresAt { get; set; }
        public UserResponseDTO User { get; set; } = null!;
    }
}
