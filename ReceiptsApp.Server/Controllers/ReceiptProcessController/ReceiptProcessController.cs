using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ReceiptsApp.Server.Controllers.ReceiptProcessController
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReceiptProcessController : ControllerBase
    {

        HttpClient _httpClient = new HttpClient();

        [Authorize]
        [HttpGet("{id}")]
        public async Task<string> ReturnProcessedOcrReceiptText (int ocrTextId)
        {
            
        }

    }
}
