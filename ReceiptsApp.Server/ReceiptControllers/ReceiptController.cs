using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using ReceiptsApp.Server.Models;

namespace ReceiptsApp.Server.ReceiptControllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptController : ControllerBase
{
    private readonly string _googleApiKey;
    public ReceiptController(IConfiguration config)
    {
        _googleApiKey = config["GoogleCloud:ApiKey"];
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

            string base64Image = System.Convert.ToBase64String(fileBytes);

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
}