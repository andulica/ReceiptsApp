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
using FuzzySharp;
using ReceiptsApp.Server.Constants;

namespace ReceiptsApp.Server.Controllers.ReceiptControllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class receiptsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ReceiptService _receiptService;
    //// 1) Add a new regex pattern for PurchaseDateTime
    private static readonly Regex PurchaseDateRegex = new Regex(
        @"(?i)(\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+\w+\s+\d{2,4}\b)",
        RegexOptions.Compiled);

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

    [HttpPost("upload")]
    public async Task<IActionResult> UploadReceipt([FromForm] IFormFile file)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in");

        Receipt receipt = new Receipt();

        var mlModel = LoadPredictionEngine();

        var ocrText = await _receiptService.ProcessOcr(file);
        Console.WriteLine("--- Raw OCR Text ---");
        Console.WriteLine(ocrText);

        List<string> rawLines = ocrText
           .Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries)
           .Select(l => l.Trim())
           .Where(l => !string.IsNullOrEmpty(l))
           .ToList();


        // --- NEW STEP: remove lines that fuzzy-match "FIL Nume ... Lei" ---
        var allLines = RemoveBetweenFilLei(rawLines);

        if (string.IsNullOrEmpty(receipt.Supplier))
        {
            foreach (var line in allLines)
            {
                foreach (var merchant in MerchantRegexPatterns.Patterns)
                {
                    if (merchant.Value.TryGetValue("CompanyName", out var companyRegex))
                    {
                        var match = companyRegex.Match(line.ToString());
                        if (match.Success)
                        {
                            receipt.Supplier = merchant.Key;
                            break;
                        }
                    }
                }

                if (!string.IsNullOrEmpty(receipt.Supplier))
                {
                    break;
                }
            }
        }

        if (!string.IsNullOrEmpty(receipt.Supplier) && MerchantRegexPatterns.Patterns.TryGetValue(receipt.Supplier, out var regexPatterns))
        {
            foreach (var line in allLines)
            {
                foreach (var pattern in regexPatterns)
                {
                    if (pattern.Key == "CompanyName") continue; // Skip checking the CompanyName again

                    var match = pattern.Value.Match(line);
                    if (match.Success)
                    {
                        switch (pattern.Key)
                        {
                            case "Address":
                                receipt.Address = match.Value;
                                break;
                            case "Total":
                                receipt.Total = match.Groups[1].Value;
                                break;
                            case "Date":
                                receipt.PurchaseDateTime = match.Groups[1].Value;
                                break;
                        }
                    }
                }
            }

            // Print results
            Console.WriteLine($"--- Supplier: {receipt.Supplier}");
            Console.WriteLine($"--- Address : {receipt.Address}");
            Console.WriteLine($"--- Total   : {receipt.Total}");
            Console.WriteLine("--- Products (Joined) ---");

            // Save receipt to DB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            //!!!!
            //    !!
            //    !!!
            //string uniqueBlobStorageName = $"{userId}{DateTime.UtcNow}";
            //receipt.UserId = userId;
            //await _receiptService.UploadToBlobStorage(file, uniqueBlobStorageName);
            //receipt.BlobName = uniqueBlobStorageName;
            //_dbContext.Receipts.Add(receipt);
            //await _dbContext.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Receipt uploaded and OCR processed successfully",
            CompanyName = receipt.Supplier,
            Address = receipt.Address,
            //Products = confirmedProducts
        });
    }

    private List<string> RemoveBetweenFilLei(List<string> lines)
    {
        var result = new List<string>();
        int i = 0;
        while (i < lines.Count)
        {
            string currentLine = lines[i].Trim();
            // Check fuzzy match for "FIL"
            int scoreFil = Fuzz.Ratio(currentLine, "Fil"); // to do later we need to apply this rule for upper case letters and small letters. 
            if (scoreFil >= 70)
            {
                // We suspect start of the "FIL -> Lei" block
                // We'll collect lines until we see "Lei" (≥70).
                bool foundLei = false;
                int j = i; // remember start

                // Move forward from line i+1 until we find "Lei"
                int k = i + 1;
                while (k < lines.Count)
                {
                    string nextLine = lines[k].Trim();
                    int scoreLei = Fuzz.Ratio(nextLine, "Lei");
                    if (scoreLei >= 70)
                    {
                        // We found the "Lei" line => skip everything from i..k inclusive
                        foundLei = true;
                        // Move i to k+1
                        i = k + 1;
                        break;
                    }
                    k++;
                }

                if (!foundLei)
                {
                    // We never found a "Lei" => keep all lines from i..k-1
                    // since we do NOT remove anything
                    // So we add them to result
                    for (int idx = i; idx < k; idx++)
                    {
                        result.Add(lines[idx]);
                    }
                    i = k; // continue from k
                }
            }
            else
            {
                // Not a "FIL" line => keep it
                result.Add(currentLine);
                i++;
            }
        }

        return result;
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