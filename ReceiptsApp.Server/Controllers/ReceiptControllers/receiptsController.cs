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

    public receiptsController(

        ApplicationDbContext dbContext,
        UserManager<IdentityUser> userManager,
        ReceiptService receiptService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _receiptService = receiptService;
    }

    // 1) Define an enum to identify our regex types:
    public enum MyRegexType
    {
        CompanyName,
        AddressLine,
        ProductLine
    }

    // 2) Dictionary with two patterns: CompanyName & AddressLine
    private static readonly Dictionary<MyRegexType, string> MyRegexPatterns =
        new Dictionary<MyRegexType, string>
        {
            {
                MyRegexType.CompanyName,

            @"(?im)^(?<companyName>(?:S\.?C\.?\s+)?.*?\s+(?:S\.?R\.?L\.?|S\.?C\.?S\.?|S\.?N\.?C\.?|S\.?A\.?))\s*$"
            },
            {
                MyRegexType.AddressLine,
 
            @"(?im)^(?!C\.?I\.?F|CIF|Cod\s+Identificare\s+Fiscala)(?<addressLine>.+)$"
            },
            { 
                MyRegexType.ProductLine, @"(?im)^(?<productLine>.*?\d+(?:[\.,]\d+)?\s+[ABCD])\s*$"
            }
        };

    private string GetPattern(MyRegexType type)
    {
        return MyRegexPatterns[type];
    }


    [HttpPost("upload")]
    public async Task<IActionResult> UploadReceipt([FromForm] IFormFile file)
    {
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in");

        Receipt receipt = new Receipt();

        // 1) Load the ML model
        MLContext mlContext = new MLContext();
        var loadedModel = mlContext.Model.Load("LineClassificationModel.zip", out var modelInputSchema);
        var predictionEngine = mlContext.Model.CreatePredictionEngine<LineData, LinePrediction>(loadedModel);

        try
        {
            // 2) OCR
            var ocrText = await _receiptService.ProcessOcr(file);
            Console.WriteLine("--- Raw OCR Text ---");
            Console.WriteLine(ocrText);

            // 3) Split into lines
            string[] allLines = ocrText.Split(
                new[] { "\r\n", "\n" },
                StringSplitOptions.RemoveEmptyEntries
            );

            // =========== A) CLASSIFY MERCHANT & ADDRESS VIA ML (LINE BY LINE) ===========
            int firstNonMerchantIndex = -1;
            for (int i = 0; i < allLines.Length; i++)
            {
                string line = allLines[i].Trim();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var (label, conf) = ClassifyLine(predictionEngine, line);
                Console.WriteLine($"Line: {line}");
                Console.WriteLine($"   -> Label: {label}, Confidence: {conf:P2}");

                if (conf < 0.8f)
                {
                    // not sure => break or skip
                    continue;
                }

                if (label == "MERCHANT_NAME")
                {
                    if (string.IsNullOrEmpty(receipt.Supplier))
                        receipt.Supplier = line;
                    else
                        receipt.Supplier += " " + line;
                }
                else if (label == "LOCATION_LINE")
                {
                    if (string.IsNullOrEmpty(receipt.Address))
                        receipt.Address = line;
                    else
                        receipt.Address += ", " + line;
                }
                else if (label == "TOTAL_LINE")
                {
                    // We see "TOTAL" or "SUBTOTAL" etc.
                    // Attempt to also grab the next line if it's numeric or unrecognized with <80% confidence.
                    string totalLineValue = line; // store the text (like "TOTAL" or "SUBTOTAL")

                    // Peek next line if it exists
                    if (i + 1 < allLines.Length)
                    {
                        string nextLine = allLines[i + 1].Trim();
                        var (nextLabel, nextConf) = ClassifyLine(predictionEngine, nextLine);

                        // If the model isn't confident about the next line
                        // or if it's unrecognized, let's see if it's parseable as a decimal
                        if (nextConf < 0.8f || nextLabel == "UNRECOGNIZED_LINE")
                        {
                            receipt.Total = nextLine;
                        }
                    }  
                }
                else
                {
                    // If we get some other label (e.g. PRODUCT_LINE or TOTAL_LINE),
                    // let's record the first line that isn't MERCHANT_NAME/LOCATION_LINE
                    if (firstNonMerchantIndex < 0)
                        firstNonMerchantIndex = i;
                    // We won't break here, but you could if you only want a contiguous merchant/address block
                }
            }

            // =========== B) FIND START INDEX FOR PRODUCTS (e.g., after CIF or "Cod Fiscala") ==========
            Regex skipLineRegex = new Regex(@"(?im)^(?:C\.?I\.?F|CIF|Cod\s+Identificare\s+Fiscala)", RegexOptions.Compiled);
            int endOfAddressIndex = -1;
            for (int i = firstNonMerchantIndex; i < allLines.Length; i++)
            {
                string line = allLines[i].Trim();
                if (skipLineRegex.IsMatch(line))
                {
                    endOfAddressIndex = i;
                    break;
                }
            }
            int startIndexForProducts = (endOfAddressIndex >= 0)
                ? (endOfAddressIndex + 1)
                : firstNonMerchantIndex;

            // =========== C) BUILD PRODUCT BLOCKS with your existing 'endOfProductRegex' ===========
            // This identifies the line that ends a product: e.g. "9.49 B"
            Regex endOfProductRegex = new Regex(@"(?im)\d+(?:[\.,]\d+)?\s+[ABCD]\s*$", RegexOptions.Compiled);

            var productBlocks = new List<List<string>>();
            var currentBlock = new List<string>();

            for (int i = startIndexForProducts; i < allLines.Length; i++)
            {
                string line = allLines[i].Trim();
                if (skipLineRegex.IsMatch(line))
                    continue;  // skip "CIF" lines

                currentBlock.Add(line);

                // If line ends with "<price> <VAT letter>", finalize block
                if (endOfProductRegex.IsMatch(line))
                {
                    productBlocks.Add(new List<string>(currentBlock));
                    currentBlock.Clear();
                }
            }
            // If leftover lines (incomplete block?), optional:
            if (currentBlock.Count > 0)
            {
                productBlocks.Add(new List<string>(currentBlock));
                currentBlock.Clear();
            }

            // =========== D) JOIN each product block & FEED to ML as a SINGLE string ===========
            var confirmedProducts = new List<string>();

            foreach (var block in productBlocks)
            {
                // Join lines with a space or a separator
                string joined = string.Join(" ", block);

                // Now feed this single joined line to ML
                var (pLabel, pConf) = ClassifyLine(predictionEngine, joined);

                if (pLabel == "PRODUCT_LINE" && pConf >= 0.8f)
                {
                    confirmedProducts.Add(joined);
                }
                else
                {
                    // Low confidence or different label => skip
                    Console.WriteLine($"Skipping block: {joined} => Label={pLabel}, Conf={pConf:P2}");
                }
            }

            // =========== E) Print results ===========
            Console.WriteLine($"--- Supplier: {receipt.Supplier}");
            Console.WriteLine($"--- Address : {receipt.Address}");
            Console.WriteLine($"--- Total   : {receipt.Total}");
            Console.WriteLine("--- Products (Joined) ---");
            foreach (var prod in confirmedProducts)
            {
                Console.WriteLine($"   {prod}");
            }

            return Ok(new
            {
                message = "Receipt uploaded and OCR processed successfully",
                CompanyName = receipt.Supplier,
                Address = receipt.Address,
                Products = confirmedProducts
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error processing receipt: {ex.Message}");
        }
    }

    // helper for ML classification
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