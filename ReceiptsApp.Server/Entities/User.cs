namespace ReceiptsApp.Server.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!; // Plain text for demo, NOT recommended for production
    }

}
