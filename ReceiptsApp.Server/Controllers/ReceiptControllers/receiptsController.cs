using Azure.Storage.Blobs;
using ReceiptsApp.Server.MLModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using ReceiptsApp.Server.Services;
using System.Text.RegularExpressions;
using ReceiptsApp.Server.Models;
using System.Globalization;

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
        Receipt receipt = new Receipt();

        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in");

        var uniqueFileName = _receiptService.GenerateUniqueFileName(userId, file.FileName);


        MLContext MLContext = new MLContext();
        var loadedModel = MLContext.Model.Load("LineClassificationModel.zip", out var modelInputSchema);
        var predictionEngine = MLContext.Model.CreatePredictionEngine<LineData, LinePrediction>(loadedModel);
        try
        {
            //await _receiptService.UploadToBlobStorage(file, uniqueFileName);
            var ocrText = await _receiptService.ProcessOcr(file);
            var receiptText = await _receiptOcrProcessingService.MergeLinesViaChatGpt(ocrText);

            Console.WriteLine("------ Transformed Receipt ------");
            Console.WriteLine(receiptText);

            Console.WriteLine("Ce mai faci tu?");


            Console.WriteLine("\n------ ML Classification Results ------");
            var lines = receiptText.Split(
                            new[] { "\r\n", "\n" },
                            StringSplitOptions.RemoveEmptyEntries);

                        Regex regexFormatA = new Regex(
                @"^\s*([\d.,]+)\s+([A-Za-z]+)\s*[xX]\s*([\d.,]+)\s+(.+?)\s+([\d.,]+)\s+([A-Za-z])?\s*$",
                RegexOptions.Compiled
            );

                        Regex regexFormatB = new Regex(
                @"^\s*(.+?)\s+([\d.,]+)\s+([A-Za-z])\s*$",
                RegexOptions.Compiled
            );

            var parsedProducts = new List<ReceiptProduct>();


            foreach (var line in lines)
            {
                var lineData = new LineData { TextLinie = line };
                var prediction = predictionEngine.Predict(lineData);

                string predictedLabel = prediction.PredictedLineLabel;
                float maxScore = prediction.Score?.Max() ?? 0f;

                if (predictedLabel == "MERCHANT_NAME" && maxScore >= 0.8f)
                {
                    receipt.Supplier = line;
                }

                if (predictedLabel == "TOTAL_LINE" && maxScore >= 0.8f)
                {
                    receipt.Total = Convert.ToDecimal(line);
                }

                if (predictedLabel == "LOCATION_LINE" && maxScore >= 0.8f)
                {
                    receipt.Address += line.ToString();
                }

                //{
                //    string rawTotal = line.Split(" ")[^1]; // last word
                //    receipt.Total = ParseDecimalRomanianStyle(rawTotal);
                //}

                if (predictedLabel == "PRODUCT_LINE" && maxScore >= 0.8f)
                {
                    // Try Format A first
                    Match matchA = regexFormatA.Match(line);
                    if (matchA.Success)
                    {                     

                        string rawQuantity = matchA.Groups[1].Value;
                        string rawUnitMeasure = matchA.Groups[2].Value;
                        string rawUnitPrice = matchA.Groups[3].Value;
                        string productName = matchA.Groups[4].Value.Trim();
                        string rawTotalPrice = matchA.Groups[5].Value;
                        string rawCategory = matchA.Groups[6].Value; // might be ""
                        Console.WriteLine($"RawQuantity: {rawQuantity} ");
                        Console.WriteLine($"RawUnitMeasure: {rawUnitMeasure} ");
                        Console.WriteLine($"RawUnitPrice: {rawUnitPrice} ");
                        Console.WriteLine($"Product Name: {productName} ");
                        Console.WriteLine($"Raw Total Price: {rawTotalPrice} ");
                        Console.WriteLine($"Raw category: {rawCategory} ");

                        // Convert strings to numeric
                        decimal quantity = ParseDecimalRomanianStyle(rawQuantity);

                        // If no category matched, set a default
                        string category = string.IsNullOrEmpty(rawCategory) ? "N/A" : rawCategory;

                        var product = new ReceiptProduct
                        {
                            Receipt = receipt,
                            ProductName = productName,
                            Quantity = (int)(quantity),  // or store as decimal if you want partial units
                            UnitMeasure = rawUnitMeasure,
                            UnitPrice = Convert.ToDecimal(rawUnitPrice),
                            TotalPrice =Convert.ToDecimal(rawTotalPrice),
                            Category = category
                        };
                        parsedProducts.Add(product);
                    }
                    else
                    {
                        // Try Format B (fallback)
                        Match matchB = regexFormatB.Match(line);
                        if (matchB.Success)
                        {

                            //trebuie sa adaug si celelalte campuri cum ar fi unit price, unit of measure si sa scot Parse Decimal function 
                            string productName = matchB.Groups[1].Value.Trim();
                            string rawPrice = matchB.Groups[2].Value;
                            string rawCategory = matchB.Groups[3].Value; // e.g. "C"

                            //decimal totalPrice = ParseDecimalRomanianStyle(rawPrice);

                            // In the fallback, we assume quantity=1, measure=BUC, unitPrice= totalPrice
                            var product = new ReceiptProduct
                            {
                                ProductName = productName,
                                Quantity = 1,
                                UnitMeasure = "BUC",  // or "UNSPECIFIED"
                                //UnitPrice = totalPrice,
                                TotalPrice = Convert.ToDecimal(rawPrice),
                                Category = rawCategory
                            };
                            parsedProducts.Add(product);
                        }
                        else
                        {
                            // If neither pattern matches, you might log a warning or handle differently
                            Console.WriteLine($"Could not parse product line with regex: {line}");
                        }
                    }
                }

                //await _receiptService.SaveReceiptAsync(userId, uniqueFileName, receiptText);
            }
            return Ok(new { message = "Receipt uploaded and OCR processed" });

        }

        catch (Exception ex)
        {
            return StatusCode(500, $"Error processing receipt: {ex.Message}");
        }
    }

    private decimal ParseDecimalRomanianStyle(string raw)
    {
        // In Romanian formatting, often comma is used for decimals,
        // but your input might be mixed (some lines with dot, some with comma).
        // A simple approach: replace commas with dots, then parse.
        // Also remove thousand-separators if needed.
        string normalized = raw
                           .Replace(".", "")     // remove thousands '.' if that occurs
                           .Replace(",", ".");   // replace decimal comma with dot
                                                 // Now parse
        if (decimal.TryParse(normalized, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
        {
            return result;
        }
        return 0m; // or throw an exception
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