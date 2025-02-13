using System.Text.Json;
using System.Text;
using Microsoft.ML;
using ReceiptsApp.Server.MLModels;

namespace ReceiptsApp.Server.Services
{
    public class ReceiptOcrProcessingService
    {
        private readonly string _chatGptApiKey;
        private readonly HttpClient _http = new HttpClient();

        private readonly MLContext _mlContext;
        private readonly PredictionEngine<LineData, LinePrediction> _predictionEngine;

        public ReceiptOcrProcessingService(IConfiguration config)
        {
            _chatGptApiKey = config["CHATGPT_API_KEY:API_KEY"]
                ?? throw new InvalidOperationException("OpenAI API Key is missing.");

            _mlContext = new MLContext();
            var loadedModel = _mlContext.Model.Load("LineClassificationModel.zip", out var modelInputSchema);
            _predictionEngine = _mlContext.Model.CreatePredictionEngine<LineData, LinePrediction>(loadedModel);
        }
        public async Task<string> MergeLinesViaChatGpt(string rawOcrText)
        {
            try
            {
                var systemMessage = new Dictionary<string, string>
                {
                    {"role", "system"},
                    {
                        "content",
                        @"You are ChatGPT. You receive a block of text extracted via OCR from a Romanian receipt.
                        Your task is to restructure **only** the product lines so that each product is on a single line,
                        while preserving all other text **exactly** as it is.

                        ### How to Identify and Transform Product Lines

                        1. **Product Line Patterns**  
                           - A product is often split into **three lines** in the receipt text:
                             1) A line with quantity, unit of measure (e.g., ""BUC""), ""x"", and a price per unit (e.g., ""1.000 BUC x 4.31"").
                             2) A line containing the product name or short description (e.g., ""AFINE CAS 125GR"").
                             3) A line that contains the total price which is resulted from multiplying the price per unit with the number of units plus an identifying letter which is just VAT tax applied for the type of product (e.g., ""4.31 B"" or ""6.99 C"").

                           - Also the total is usually split into 2 lines like so :
                                TOTAL
                                70.51
                           - What I want is to have the number following the total to be put on a single line.

                        2. **Merging Into a Single Line**  
                           - Concatenate all lines belonging to the same product **in order**. 
                           - Separate each piece of text with a space.
                           - **Preserve** the original text content, just combine the lines. 
                           - Do **not** add or remove words or punctuation. 
                           - Do **not** change the order of items.

                        3. **Leave Everything Else As Is**  
                           - Any other text not related to the product details (store info, fiscal codes, totals, VAT details, or promotional messages) 
                             must remain **unchanged** and in the same position/lines as you found it.

                        ### Output Format

                        - Return the **entire receipt** text as plain text.
                        - In that text, each product should be on a single line if it was originally split across multiple lines.
                        - Do not wrap the entire output in JSON or any other format. Simply return the transformed text.

                        ### Important Constraints

                        - Do not insert extra commentary, explanation, or disclaimers—only return the corrected text block.
                        - If there are no product lines or the text is not relevant, simply return it unchanged.


                        ### Example:

                        - This is the input text:

                        @""S.C. REWE (ROMANIA) 5.R.L. PENNY.
                        MUNICIPIUL CALARASI
                        STR. PRELUNGIREA BUCURESTI, NR. 93-95
                        JUDETUL CALARASI
                        Cod Identificare Fiscala: R013348610
                        FII
                        Nume Caster
                        04314 0 17
                        Lel
                        1.000 BUC × 4.31
                        SACOSA
                        4.31 B
                        1.000 BUC × 0.18
                        ECOTAXA 0.18 RON
                        0.18 B
                        1.000 BUC X 24.99
                        PERNA
                        24.99 B

                        - This is how the output should look like:

                        @""S.C. REWE (ROMANIA) 5.R.L. PENNY.
                        MUNICIPIUL CALARASI
                        STR. PRELUNGIREA BUCURESTI, NR. 93-95
                        JUDETUL CALARASI
                        Cod Identificare Fiscala: R013348610
                        FII
                        Nume Caster
                        04314 0 17
                        Lel
                        1.000 BUC × 4.31 SACOSA 4.31 B
                        1.000 BUC × 0.18 ECOTAXA 0.18 RON 0.18 B
                        1.000 BUC X 24.99 PERNA 24.99 B"
                    }
                };

                var userMessage = new Dictionary<string, string>
                {
                    {"role", "user"},
                    {
                        "content", rawOcrText
                    }
                };

                var messages = new List<Dictionary<string, string>>
                {
                    systemMessage,
                    userMessage
                };

                var gptResponse = await GetOpenAiResponseAsync(messages);

                return gptResponse;
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        public async Task<string> GetOpenAiResponseAsync(List<Dictionary<string, string>> messages)
        {
            if (string.IsNullOrEmpty(_chatGptApiKey))
                throw new InvalidOperationException("OpenAI API Key is missing.");

            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = messages,
                max_tokens = 4000,
                temperature = 0.7
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
            {
                Headers = { { "Authorization", $"Bearer {_chatGptApiKey}" } },
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };

            var response = await _http.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);

            var result = doc
                .RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return result?.Trim() ?? "No response from OpenAI.";
        }

        
    }
}