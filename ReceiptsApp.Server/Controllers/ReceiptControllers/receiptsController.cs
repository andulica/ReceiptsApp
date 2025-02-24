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

    //// 1) Define an enum to identify our regex types:
    //public enum MyRegexType
    //{
    //    CompanyName,
    //    AddressLine,
    //    ProductLine,
    //    Penny
    //}

    //// 2) Dictionary with two patterns: CompanyName & AddressLine
    //private static readonly Dictionary<MyRegexType, string> MyRegexPatterns =
    //    new Dictionary<MyRegexType, string>
    //    {
    //        {
    //            MyRegexType.CompanyName,

    //        @"(?im)^(?<companyName>(?:S\.?C\.?\s+)?.*?\s+(?:S\.?R\.?L\.?|S\.?C\.?S\.?|S\.?N\.?C\.?|S\.?A\.?))\s*$"
    //        },
    //        {
    //            MyRegexType.AddressLine,
 
    //        @"(?im)^(?!C\.?I\.?F|CIF|Cod\s+Identificare\s+Fiscala)(?<addressLine>.+)$"
    //        },
    //        { 
    //            MyRegexType.ProductLine, @"(?im)^(?<productLine>.*?\d+(?:[\.,]\d+)?\s+[ABCD])\s*$"
    //        },
    //        {
    //            MyRegexType.Penny, @" ^(?i)(?:fil  |fii  |fll  |eil  |eii  |ell  |fl ).*?(?: lei  |lel  |le   |le)$"
    //        }
    //    };

    //private string GetPattern(MyRegexType type)
    //{
    //    return MyRegexPatterns[type];
    //}


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

        bool firstLineForTotal = true;
        try
        {
            // 2) OCR
            var ocrText = await _receiptService.ProcessOcr(file);
            Console.WriteLine("--- Raw OCR Text ---");
            Console.WriteLine(ocrText);

            // 3) Split into lines
            List<string> rawLines = ocrText
               .Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries)
               .Select(l => l.Trim())
               .Where(l => !string.IsNullOrEmpty(l))
               .ToList();


            // --- NEW STEP: remove lines that fuzzy-match "FIL Nume ... Lei" ---
            var allLines = RemoveBetweenFilLei(rawLines);

            // =========== A) CLASSIFY MERCHANT & ADDRESS VIA ML (LINE BY LINE) ===========
            int firstNonMerchantIndex = -1;
            for (int i = 0; i < allLines.Count; i++)
            {
                string line = allLines[i].Trim();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var (label, conf) = ClassifyLine(predictionEngine, line);
                Console.WriteLine($"Line: {line}");
                Console.WriteLine($"   -> Label: {label}, Confidence: {conf:P2}");

                if (conf < 0.8f)
                {
                    // not sure => skip
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
                else if (label == "TOTAL_LINE" && firstLineForTotal)
                {
                    firstLineForTotal = false;
                    // Attempt to also grab the next line if numeric or unrecognized
                    if (i + 1 < allLines.Count)
                    {
                        string nextLine = allLines[i + 1].Trim();
                        var (nextLabel, nextConf) = ClassifyLine(predictionEngine, nextLine);

                        if (nextConf < 0.8f || nextLabel == "UNRECOGNIZED_LINE")
                        {
                            // interpret it as total
                            receipt.Total = nextLine;
                        }
                    }
                }
                else
                {
                    // If we get some other label (PRODUCT_LINE, etc.),
                    // track first line that isn't merchant/address
                    if (firstNonMerchantIndex < 0)
                        firstNonMerchantIndex = i;
                }
            }

            // =========== B) FIND START INDEX FOR PRODUCTS (CIF or "Cod Fiscala") ==========
            Regex skipLineRegex = new Regex(@"(?im)^(?:C\.?I\.?F|CIF|Cod\s+Identificare\s+Fiscala)", RegexOptions.Compiled);
            int endOfAddressIndex = -1;
            for (int i = firstNonMerchantIndex; i < allLines.Count; i++)
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

            // =========== C) BUILD PRODUCT BLOCKS =========== 
            // (unchanged from your code)
            Regex endOfProductRegex = new Regex(@"(?im)\d+(?:[\.,]\d+)?\s+[ABCD]\s*$", RegexOptions.Compiled);

            var productBlocks = new List<List<string>>();
            var currentBlock = new List<string>();

            for (int i = startIndexForProducts; i < allLines.Count; i++)
            {
                string line = allLines[i].Trim();
                if (skipLineRegex.IsMatch(line))
                    continue;

                currentBlock.Add(line);

                if (endOfProductRegex.IsMatch(line))
                {
                    productBlocks.Add(new List<string>(currentBlock));
                    currentBlock.Clear();
                }
            }
            if (currentBlock.Count > 0)
            {
                productBlocks.Add(new List<string>(currentBlock));
                currentBlock.Clear();
            }

            // =========== D) JOIN + CLASSIFY PRODUCT BLOCKS =========== 
            var confirmedProducts = new List<string>();
            foreach (var block in productBlocks)
            {
                string joined = string.Join(" ", block);
                var (pLabel, pConf) = ClassifyLine(predictionEngine, joined);

                if (pLabel == "PRODUCT_LINE" && pConf >= 0.8f)
                {
                    confirmedProducts.Add(joined);
                }
                else
                {
                    Console.WriteLine($"Skipping block: {joined} => Label={pLabel}, Conf={pConf:P2}");
                }
            }

            // Print results
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