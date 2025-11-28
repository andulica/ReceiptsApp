using System.Text.Json.Serialization;

namespace ReceiptsApp.Server.Models
{
    public class ReceiptProduct
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string UnitMeasure { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int ReceiptId { get; set; } 
        public string Category { get; set; }

        [JsonIgnore] // <-- adaugă asta!
        public Receipt Receipt { get; set; } 
    }
}
