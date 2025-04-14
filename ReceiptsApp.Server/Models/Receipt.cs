namespace ReceiptsApp.Server.Models
{
    public class Receipt
    {
        public int Id { get; set; }
        public string UserId { get; set; } = default!;
        //public IdentityUser? User { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Supplier { get; set; } = string.Empty;
        public string PurchaseDateTime { get; set; }
        public string Total { get; set; }
        public string? OcrText { get; set; }
        public string BlobName { get; set; } = string.Empty;
        public List<ReceiptProduct> Products { get; set; }
    }
}