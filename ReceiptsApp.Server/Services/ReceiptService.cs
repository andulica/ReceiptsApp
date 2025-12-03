using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ReceiptsApp.Server.Models;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

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

        // 🧠 REGEX-uri universale (independente de comerciant)
        private static readonly Regex SupplierRegex = new Regex(@"^(S\.C\.|S\.R\.L\.|S\.A\.|P\.F\.A\.|I\.F\.|S\.C\.S\.|S\.C\.M\.|C\.I\.)\s+.+", RegexOptions.IgnoreCase);


        private static readonly Regex AddressRegex =
            new(@"(JUDET[^\n]*|MUNICIPIUL[^\n]*|STR\.?.*?NR\.?.*)", RegexOptions.IgnoreCase);

        private static readonly Regex DateRegex =
            new(@"\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b", RegexOptions.IgnoreCase);

        private static readonly Regex TotalRegex =
            new(@"TOTAL(?:\s+LEI|\s*PLATA|\s*:)?\s*(\d+[.,]\d{2})|(\b\d+[.,]\d{2}\b)$", RegexOptions.IgnoreCase);

        // 🛒 Regex universal pentru produse
        private static readonly Regex ProductRegex = new(
            @"(?<qty>\d+[.,]?\d*)\s*(?<unit>BUC|KG|L|G|ML)\s*x\s*(?<price>\d+[.,]\d{2})(?:\s+(?<name>[A-Z0-9\s\.\-]+))?",
            RegexOptions.IgnoreCase);

        // 🧹 Regexuri pentru linii de zgomot (fără valoare)
        private static readonly Regex[] NoisePatterns = new[]
        {
            new Regex(@"BON\s*FISCAL", RegexOptions.IgnoreCase),
            new Regex(@"AUTH", RegexOptions.IgnoreCase),
            new Regex(@"TERMINAL", RegexOptions.IgnoreCase),
            new Regex(@"BATCH", RegexOptions.IgnoreCase),
            new Regex(@"CASIER", RegexOptions.IgnoreCase),
            new Regex(@"CLIENT", RegexOptions.IgnoreCase),
            new Regex(@"CARD", RegexOptions.IgnoreCase),
            new Regex(@"CUI", RegexOptions.IgnoreCase),
            new Regex(@"CIF", RegexOptions.IgnoreCase),
            new Regex(@"FL\d+", RegexOptions.IgnoreCase),
            new Regex(@"ROS\d+", RegexOptions.IgnoreCase),
            new Regex(@"TVA", RegexOptions.IgnoreCase),
            new Regex(@"ACCUM", RegexOptions.IgnoreCase)
        };

        // 🔧 Funcție principală
        public Receipt ParseOcrText(string ocrText)
        {
            Console.WriteLine("\n=== 🧾 OCR RAW TEXT START ===");
            Console.WriteLine(ocrText);
            Console.WriteLine("=== 🧾 OCR RAW TEXT END ===\n");

            var receipt = new Receipt { Products = new List<ReceiptProduct>() };

            var lines = Regex.Split(ocrText, @"\r\n|\r|\n")
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrEmpty(l))
                .ToList();

            // eliminare zgomot
            lines = lines.Where(l => !NoisePatterns.Any(rx => rx.IsMatch(l))).ToList();

            Console.WriteLine($"Total lines after cleaning: {lines.Count}");
            foreach (var l in lines)
                Console.WriteLine($"Line: {l}");

            // 🏪 Supplier
            string[] legalForms = new[] { "S.C.", "S.R.L.", "S.A.", "P.F.A.", "I.F.", "S.C.S.", "S.C.M.", "C.I." };
            string[] knownMerchants = new[] { "PENNY", "KAUFLAND", "LIDL", "CARREFOUR", "AUCHAN", "MEGA IMAGE", "BON", "MAGAZIN" };

            int ScoreLine(string line)
            {
                int score = 0;

                if (legalForms.Any(f => line.IndexOf(f, StringComparison.OrdinalIgnoreCase) >= 0))
                    score += 5;

                if (knownMerchants.Any(k => line.IndexOf(k, StringComparison.OrdinalIgnoreCase) >= 0))
                    score += 3;

                if (line.All(c => char.IsUpper(c) || char.IsWhiteSpace(c) || c == '.' || c == '-' || c == ','))
                    score += 2;

                if (Regex.IsMatch(line, @"(R|CIF)\s*\d{6,}"))
                    score += 1;

                return score;
            }

            var candidateLines = lines.Take(5).ToList();

            var bestLine = candidateLines
                .Select(l => new { Line = l, Score = ScoreLine(l) })
                .OrderByDescending(x => x.Score)
                .FirstOrDefault();

            if (bestLine != null && bestLine.Score > 0)
            {
                receipt.Supplier = bestLine.Line.Trim();
                Console.WriteLine($"Supplier found (best guess): {receipt.Supplier}");
            }
            else
            {
                Console.WriteLine("Supplier not found");
            }

            // 🏠 Address
            var addressMatch = lines.Select(l => AddressRegex.Match(l)).FirstOrDefault(m => m.Success);
            if (addressMatch != null)
            {
                receipt.Address = addressMatch.Value.Trim();
                Console.WriteLine($"Address found: {receipt.Address}");
            }

            // 📅 Regex universal (match pentru linii cu dată)
            Regex dateRegex = new Regex(@"(\d{1,2})[- ./](\d{1,2})[- ./](\d{2,4})");

            // Caută prima linie care conține o dată
            var dateMatch = lines
                .Select(l => dateRegex.Match(l))
                .FirstOrDefault(m => m.Success);

            if (dateMatch != null)
            {
                string dateStr = dateMatch.Value.Trim(); // ex: "12-12-2024"
                DateTime purchaseDate;

                string[] formats = new[]
                {
                    "dd/MM/yyyy", "dd-MM-yyyy", "dd.MM.yyyy", "dd MM yyyy",
                    "dd/MM/yy",   "dd-MM-yy",   "dd.MM.yy",
                    "yyyy-MM-dd", "yyyy/MM/dd"
                };

                bool success = DateTime.TryParseExact(
                    dateStr,
                    formats,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out purchaseDate);

                if (success)
                {
                    receipt.PurchaseDateTime = purchaseDate;
                    Console.WriteLine($"Date found: {purchaseDate:yyyy-MM-dd}");
                }
                else
                {
                    Console.WriteLine($"Failed to parse date: {dateStr}");
                    receipt.PurchaseDateTime = null;
                }
            }
            else
            {
                Console.WriteLine("No date detected in receipt text.");
                receipt.PurchaseDateTime = null;
            }

            // 💰 Total
            var totalMatch = lines.Select(l => TotalRegex.Match(l)).LastOrDefault(m => m.Success);
            if (totalMatch != null)
            {
                var totalValue = totalMatch.Groups[1].Success ? totalMatch.Groups[1].Value : totalMatch.Groups[2].Value;
                receipt.Total = totalValue.Replace(",", ".").Trim();
                Console.WriteLine($"Total found: {receipt.Total}");
            }

            // 🛒 Products
            Console.WriteLine("\n=== 🛍️ Products detected ===");
            for (int i = 0; i < lines.Count; i++)
            {
                var m = ProductRegex.Match(lines[i]);
                if (m.Success)
                {
                    var qty = ParseDecimal(m.Groups["qty"].Value);
                    var unitPrice = ParseDecimal(m.Groups["price"].Value);
                    var unit = m.Groups["unit"].Value.ToUpper();
                    var name = m.Groups["name"].Success ? m.Groups["name"].Value.Trim() : "";

                    if (string.IsNullOrEmpty(name) && i + 1 < lines.Count)
                    {
                        var nextLine = lines[i + 1];
                        if (!ProductRegex.IsMatch(nextLine))
                            name = nextLine;
                    }

                    var totalPrice = Math.Round(qty * unitPrice, 2);
                    Console.WriteLine($"Product: {name} | {qty} {unit} x {unitPrice} = {totalPrice}");

                    receipt.Products.Add(new ReceiptProduct
                    {
                        ProductName = name,
                        Quantity = (int)Math.Round(qty),
                        UnitMeasure = unit,
                        UnitPrice = unitPrice,
                        TotalPrice = totalPrice,
                        Category = string.Empty
                    });
                }
            }

            Console.WriteLine($"\nTotal products detected: {receipt.Products.Count}");
            Console.WriteLine("=== ✅ Parsing Completed ===\n");

            receipt.OcrText = ocrText;
            return receipt;
        }

        private static decimal ParseDecimal(string value)
        {
            value = value.Replace(",", ".");
            if (decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
                return result;
            return 0;
        }
    }
}