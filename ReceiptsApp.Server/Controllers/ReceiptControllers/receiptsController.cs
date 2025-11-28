using Azure.Storage.Blobs;
using ReceiptsApp.Server.MLModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using ReceiptsApp.Server.Services;

namespace ReceiptsApp.Server.Controllers.ReceiptControllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class receiptsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ReceiptService _receiptService;

    public receiptsController(

        ApplicationDbContext dbContext,
        UserManager<IdentityUser> userManager,
        ReceiptService receiptService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _receiptService = receiptService;
    }
    private PredictionEngine<LineData, LinePrediction> LoadPredictionEngine()
    {
        // Load the ML model
        MLContext mlContext = new MLContext();
        var loadedModel = mlContext.Model.Load("LineClassificationModel.zip", out var modelInputSchema);
        return mlContext.Model.CreatePredictionEngine<LineData, LinePrediction>(loadedModel);
    }

    // ML classification helper
    private (string Label, float Confidence) ClassifyLine(
        PredictionEngine<LineData, LinePrediction> predictionEngine,
        string text)
    {
        var input = new LineData { TextLinie = text };
        var prediction = predictionEngine.Predict(input);

        string label = prediction.PredictedLineLabel;
        float conf = prediction.Score?.Max() ?? 0f;
        return (label, conf);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadReceipt([FromForm] IFormFile file)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in");

        // 1️⃣ Generează nume unic pentru blob
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

        // 2️⃣ Încarcă fișierul în Blob Storage
        await _receiptService.UploadToBlobStorage(file, uniqueFileName);

        // 3️⃣ Rulează OCR
        var ocrText = await _receiptService.ProcessOcr(file);
        if (string.IsNullOrWhiteSpace(ocrText))
            return BadRequest("OCR returned no text");

        // 4️⃣ Parsează textul OCR
        var receipt = _receiptService.ParseOcrText(ocrText);
        receipt.UserId = userId;
        receipt.BlobName = uniqueFileName; // sau BlobUrl, dacă preferi

        // 5️⃣ Salvează în DB
        _dbContext.Receipts.Add(receipt);
        await _dbContext.SaveChangesAsync();

        // 6️⃣ Returnează doar informațiile utile
        return Ok(new
        {
            receipt.Id,
            receipt.Supplier,
            receipt.Total,
            receipt.BlobName,
            receipt.PurchaseDateTime
        });
    }


    [HttpGet("{id}/image")]
    public async Task<IActionResult> GetReceiptImage(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var receipt = await _dbContext.Receipts
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (receipt == null)
            return NotFound("Receipt not found.");

        try
        {
            var blobClient = new BlobClient(_receiptService.AzureConnectionString, "receipts", receipt.BlobName);
            var downloadResponse = await blobClient.DownloadContentAsync();
            var contentType = downloadResponse.Value.Details.ContentType ?? "application/octet-stream";
            var fileBytes = downloadResponse.Value.Content.ToArray();
            return File(fileBytes, contentType);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving image: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReceipt(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var receipt = await _dbContext.Receipts
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

            if (receipt == null)
                return NotFound("Receipt not found.");

            var blobClient = new BlobClient(_receiptService.AzureConnectionString, "receipts", receipt.BlobName);
            await blobClient.DeleteIfExistsAsync();

            _dbContext.Receipts.Remove(receipt);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error deleting receipt: {ex.Message}");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllReceipts()
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var receipts = await _dbContext.Receipts
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.Id)
            .ToListAsync();

        if (receipts.Count == 0)
        {
            return NotFound("No receipts found.");
        }

        return Ok(receipts);
    }
}