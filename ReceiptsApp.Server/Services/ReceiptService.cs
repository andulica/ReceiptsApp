using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Google.Protobuf.WellKnownTypes;
using ReceiptsApp.Server.Models;
using System.Text;
using System.Text.Json;

namespace ReceiptsApp.Server.Services
{
    public class ReceiptService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly string _googleApiKey;
        private readonly string _azureConnectionString;

        public string AzureConnectionString => _azureConnectionString;

        public ReceiptService(ApplicationDbContext dbContext, IConfiguration config)
        {
            _dbContext = dbContext;
            _googleApiKey = config["GoogleCloud:ApiKey"] ?? throw new ArgumentNullException("GoogleCloud:ApiKey");
            _azureConnectionString = config["AzureStorage:ConnectionString"] ?? throw new ArgumentNullException("AzureStorage connection string missing");
        }

        public async Task SaveReceiptAsync(string userId, string uniqueFileName, string ocrText)
        {
            var receipt = new Receipt
            {
                UserId = userId,
                BlobName = uniqueFileName,
                OcrText = ocrText,
                Supplier = string.Empty,
                PurchaseDateTime = DateTime.UtcNow,
                Total = 0,
                Products = new List<ReceiptProduct>()
        };

            _dbContext.Receipts.Add(receipt);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<string> ProcessOcr(IFormFile file)
        {
            var fileBytes = await FileToBytesAsync(file);
            var base64Image = Convert.ToBase64String(fileBytes);
            var requestPayload = new
            {
                requests = new[]
                {
                        new
                        {
                            image = new { content = base64Image },
                            features = new[] { new { type = "TEXT_DETECTION" } }
                        }
                    }
            };

            var jsonPayload = JsonSerializer.Serialize(requestPayload);
            using var httpClient = new HttpClient();
            var response = await httpClient.PostAsync($"https://vision.googleapis.com/v1/images:annotate?key={_googleApiKey}", new StringContent(jsonPayload, Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
                throw new Exception(await response.Content.ReadAsStringAsync());

            var responseContent = await response.Content.ReadAsStringAsync();
            var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);
            return responseData.GetProperty("responses")[0].GetProperty("textAnnotations")[0].GetProperty("description").GetString() ?? string.Empty;
        }

        public async Task UploadToBlobStorage(IFormFile file, string uniqueFileName)
        {
            var containerName = "receipts";
            var blobClient = new BlobClient(_azureConnectionString, containerName, uniqueFileName);

            using var fileStream = file.OpenReadStream();
            var blobUploadOptions = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = file.ContentType
                }
            };

            await blobClient.UploadAsync(fileStream, blobUploadOptions);
        }

        private async Task<byte[]> FileToBytesAsync(IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            return ms.ToArray();
        }

        public string GenerateUniqueFileName(string userId, string fileName)
        {
            return $"{userId}_{DateTime.UtcNow.Ticks}_{fileName}";
        }
    }
}