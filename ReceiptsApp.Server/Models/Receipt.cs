using Microsoft.AspNetCore.Identity;

namespace ReceiptsApp.Server.Models
{
    public class Receipt
    {
        public int Id { get; set; }
        public string UserId { get; set; } = default!;
        public IdentityUser? User { get; set; }

        public string Supplier { get; set; } = string.Empty;

        public DateTime PurchaseDateTime { get; set; }

        public decimal Total { get; set; }

        public string Products { get; set; } = string.Empty;
    }
}