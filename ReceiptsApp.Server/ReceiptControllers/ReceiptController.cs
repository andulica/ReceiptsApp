using Microsoft.AspNetCore.Mvc;
using Tesseract;

namespace ReceiptsApp.Server.ReceiptControllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptController : ControllerBase
{
    // POST api/receipt
    [HttpPost]
    public async Task<IActionResult> Post([FromForm] ReceiptUpload model)
    {
        if (model.File == null || model.File.Length == 0)
            return BadRequest("No file uploaded.");

        using var memoryStream = new MemoryStream();
        await model.File.CopyToAsync(memoryStream);
        byte[] fileBytes = memoryStream.ToArray();

        string text;
        using (var engine = new TesseractEngine(@".\tessdata", "ron+eng", EngineMode.Default))
        {
            using var img = Pix.LoadFromMemory(fileBytes);
            using var page = engine.Process(img);
            text = page.GetText();
        }

        return Ok(new { OcrText = text });
    }
}

public class ReceiptUpload
{
    public IFormFile File { get; set; }
}