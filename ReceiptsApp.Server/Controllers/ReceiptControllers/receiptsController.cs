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
        AddressLine
    }

    // 2) Dictionary with two patterns: CompanyName & AddressLine
    private static readonly Dictionary<MyRegexType, string> MyRegexPatterns =
        new Dictionary<MyRegexType, string>
    {
        // For matching a Romanian company name like:
        // "S.C. MYCOMPANY S.R.L." or "SC ANOTHERFIRM S.C.S"
        {
            MyRegexType.CompanyName,
            // Explanation:
            //  (?im) => i = case-insensitive, m = multiline
            //  ^ => start of line
            //  (?:S\.?C\.?) => matches "SC" or "S.C."
            //  \s+ => at least one space
            //  .*? => lazy capture (any text) for the company name
            //  \s+ => at least one space
            //  (?:S\.?R\.?L\.?|S\.?C\.?S\.?) => SRL or S.R.L. or SCS or S.C.S
            //  $ => end of line
@"(?im)^(?<companyName>(?:S\.?C\.?\s+)?.*?\s+(?:S\.?R\.?L\.?|S\.?C\.?S\.?|S\.?N\.?C\.?|S\.?A\.?))\s*$"
        },

        // For matching address lines (everything that does NOT start with
        // CIF, C.I.F, or "Cod Identificare Fiscala")
        {
            MyRegexType.AddressLine,
 
        @"(?im)^(?!C\.?I\.?F|CIF|Cod\s+Identificare\s+Fiscala)(?<addressLine>.+)$"
        }
    };

    // Helper method to retrieve the pattern by enum:
    private string GetPattern(MyRegexType type)
    {
        return MyRegexPatterns[type];
    }


    [HttpPost("upload")]
    public async Task<IActionResult> UploadReceipt([FromForm] IFormFile file)
    {
        // 1) Basic checks
        var userId = _userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not logged in");

        // For demonstration: create a new Receipt object (adjust to your own model)
        Receipt receipt = new Receipt();

        try
        {
            // 2) Get OCR text from the uploaded file
            var ocrText = await _receiptService.ProcessOcr(file);

            Console.WriteLine(ocrText);

            // 3) Split OCR text into lines
            string[] allLines = ocrText.Split(
                new[] { "\r\n", "\n" },
                StringSplitOptions.RemoveEmptyEntries
            );

            // 4) Identify the company name line
            Regex rxCompany = new Regex(
     GetPattern(MyRegexType.CompanyName),
     RegexOptions.Compiled | RegexOptions.IgnorePatternWhitespace
 );

            int companyLineIndex = -1;
            string companyName = null;

            for (int i = 0; i < allLines.Length; i++)
            {
                string line = allLines[i].Trim();
                Match match = rxCompany.Match(line);
                if (match.Success)
                {
                    // Found the company name line
                    companyLineIndex = i;

                    // Use the named capture group "companyName" if present
                    if (match.Groups["companyName"].Success)
                        companyName = match.Groups["companyName"].Value;
                    else
                        companyName = line; // fallback if capture fails

                    receipt.Supplier = companyName; // store in receipt
                    break;
                }
            }

            // 5) Collect address lines below that line until we see "CIF", "C.I.F", or "Cod..."
            List<string> addressLines = new List<string>();
            if (companyLineIndex >= 0 && companyLineIndex < allLines.Length - 1)
            {
                Regex rxAddressLine = new Regex(
                    GetPattern(MyRegexType.AddressLine),
                    RegexOptions.Compiled | RegexOptions.IgnorePatternWhitespace
                );

                for (int i = companyLineIndex + 1; i < allLines.Length; i++)
                {
                    string line = allLines[i].Trim();

                    // If this line matches the "address line" pattern, it's part of the address
                    if (rxAddressLine.IsMatch(line))
                    {
                        addressLines.Add(line);
                    }
                    else
                    {
                        // Once we hit a line that starts with "CIF", "C.I.F", or "Cod..."
                        // we stop collecting address lines
                        break;
                    }
                }
            }

            // Join address lines into a single string (or store them separately)
            receipt.Address = string.Join(", ", addressLines);

            // Optionally, you can process any further lines for product data or totals...
            // For now, we just show a summary:

            Console.WriteLine($"Detected Company: {receipt.Supplier}");
            Console.WriteLine("Detected Address:");
            foreach (var addr in addressLines)
                Console.WriteLine($"   {addr}");

            // 6) Return success response
            return Ok(new
            {
                message = "Receipt uploaded and OCR processed successfully",
                CompanyName = receipt.Supplier,
                Address = receipt.Address
            });
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