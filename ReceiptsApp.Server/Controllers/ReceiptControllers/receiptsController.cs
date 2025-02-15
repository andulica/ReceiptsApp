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
    private readonly ReceiptOcrProcessingService _receiptOcrProcessingService;   

    public receiptsController(

        ApplicationDbContext dbContext,
        UserManager<IdentityUser> userManager,
        ReceiptService receiptService,
        ReceiptOcrProcessingService receiptOcrProcessingService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _receiptService = receiptService;
        _receiptOcrProcessingService = receiptOcrProcessingService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadReceipt([FromForm] IFormFile file)
    {

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in");

        var uniqueFileName = _receiptService.GenerateUniqueFileName(userId, file.FileName);

        MLContext MLContext = new MLContext();
        var loadedModel = MLContext.Model.Load("LineClassificationModel.zip", out var modelInputSchema);
        var predictionEngine = MLContext.Model.CreatePredictionEngine<LineData, LinePrediction>(loadedModel);
        try
        {
            await _receiptService.UploadToBlobStorage(file, uniqueFileName);
            var ocrText = await _receiptService.ProcessOcr(file);
            var receiptText = await _receiptOcrProcessingService.MergeLinesViaChatGpt(ocrText);

            Console.WriteLine("------ Transformed Receipt ------");
            Console.WriteLine(receiptText);

            Console.WriteLine("\n------ ML Classification Results ------");
            var lines = receiptText.Split(
                            new[] { "\r\n", "\n" },
                            StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var lineData = new LineData { TextLinie = line };
                var prediction = predictionEngine.Predict(lineData);

                string predictedLabel = prediction.PredictedLineLabel;
                float[] scores = prediction.Score; // The probabilities or raw scores for each class
                float maxScore = scores?.Max() ?? 0f;

                bool isProductWithHighConfidence = (predictedLabel == "Product" && maxScore >= 0.8f);

                Console.WriteLine($"Line: {line}");
                Console.WriteLine($"   -> Predicted label: {predictedLabel}, confidence: {maxScore:P2}");

                if (isProductWithHighConfidence)
                {
                    Console.WriteLine("   ** This line is highly likely to be a product. **");
                }
            }

            return Ok(new { message = "Receipt uploaded and OCR processed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error processing receipt: {ex.Message}");
        }
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