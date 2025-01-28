using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using ReceiptsApp.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace ReceiptsApp.Server.Controllers.ReceiptControllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptController : ControllerBase
{
    private readonly string _googleApiKey;
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<IdentityUser> _userManager;
    public ReceiptController(IConfiguration config, ApplicationDbContext dbContext, UserManager<IdentityUser> userManager)
    {
        _googleApiKey = config["GoogleCloud:ApiKey"];
        _dbContext = dbContext;
        _userManager = userManager;
    }
    private const string VisionApiUrl = "https://vision.googleapis.com/v1/images:annotate";

    [HttpPost]
    public async Task<IActionResult> Post([FromForm] ReceiptUpload model)
    {
        if (model.File == null || model.File.Length == 0)
            return BadRequest("No file uploaded.");

        try
        {
            using var memoryStream = new MemoryStream();
            await model.File.CopyToAsync(memoryStream);
            byte[] fileBytes = memoryStream.ToArray();

            string base64Image = Convert.ToBase64String(fileBytes);

            var requestPayload = new
            {
                requests = new[]
                {
                    new
                    {
                        image = new { content = base64Image },
                        features = new[]
                        {
                            new { type = "TEXT_DETECTION" }
                        }
                    }
                }
            };

            string jsonPayload = JsonSerializer.Serialize(requestPayload);

            using var httpClient = new HttpClient();
            var response = await httpClient.PostAsync(
                $"{VisionApiUrl}?key={_googleApiKey}",
                new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            );

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());

            string responseContent = await response.Content.ReadAsStringAsync();
            var responseData = JsonSerializer.Deserialize<JsonElement>(responseContent);

            var ocrText = responseData.GetProperty("responses")[0]
                .GetProperty("textAnnotations")[0]
                .GetProperty("description")
                .GetString();

            return Ok(new { OcrText = ocrText });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error processing receipt: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateReceipt([FromBody] ReceiptCreateModel model)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var receipt = new Receipt
        {
            UserId = user.Id,
            Supplier = model.Supplier,
            PurchaseDateTime = model.PurchaseDateTime,
            Total = model.Total,
            Products = model.Products
        };

        _dbContext.Receipts.Add(receipt);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Receipt created", receiptId = receipt.Id });
    }
}

public class ReceiptCreateModel
{
    public string Supplier { get; set; } = string.Empty;
    public DateTime PurchaseDateTime { get; set; }
    public decimal Total { get; set; }
    public string Products { get; set; } = string.Empty;
}