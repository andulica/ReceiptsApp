using System.Text.RegularExpressions;

namespace ReceiptsApp.Server.Constants
{
    public static class MerchantRegexPatterns
    {
        public static readonly Dictionary<string, Dictionary<string, Regex>> Patterns = new()
        {
            {
                "Penny", new Dictionary<string, Regex>
                {
                    { "CompanyName", new Regex(@"S\.C\. REWE \(ROMANIA\) S\.R\.L\./ PENNY", RegexOptions.IgnoreCase) },
                    { "Address", new Regex(@"MUNICIPIUL\s+\w+,\s+STR\.\s+.+", RegexOptions.IgnoreCase) },
                    { "ProductLine", new Regex(@"\d{1,3}\.\d{3}\s+BUC\s+x\s+\d+\.\d+", RegexOptions.IgnoreCase) },
                    { "Total", new Regex(@"TOTAL\s*:\s*(\d+\.\d+)", RegexOptions.IgnoreCase) },
                    { "Date", new Regex(@"\b(\d{2}/\d{2}/\d{4})\b", RegexOptions.IgnoreCase) },
                    { "Time", new Regex(@"\b(\d{2}:\d{2}:\d{2})\b", RegexOptions.IgnoreCase) }
                }
            },
            {
                "Lidl", new Dictionary<string, Regex>
                {
                    { "CompanyName", new Regex(@"SC\s+LIDL\s+ROMANIA\s+SRL", RegexOptions.IgnoreCase) },
                    { "Address", new Regex(@"STR\.\s+[A-Z]+\s+\d+, MUNICIPIUL\s+\w+", RegexOptions.IgnoreCase) },
                    { "ProductLine", new Regex(@"\d{1,3}\.\d{3}\s+BUC\s+x\s+\d+\.\d+", RegexOptions.IgnoreCase) },
                    { "Total", new Regex(@"TOTAL\s*:\s*(\d+\.\d+)", RegexOptions.IgnoreCase) },
                    { "Date", new Regex(@"\b(\d{2}/\d{2}/\d{4})\b", RegexOptions.IgnoreCase) },
                    { "Time", new Regex(@"\b(\d{2}:\d{2}:\d{2})\b", RegexOptions.IgnoreCase) }
                }
            },
            {
                "Kaufland", new Dictionary<string, Regex>
                {
                    { "CompanyName", new Regex(@"S\.C\. KAUFLAND ROMANIA S\.C\.S\.", RegexOptions.IgnoreCase) },
                    { "Address", new Regex(@"MUN\.\s+[A-Z]+,\s+STRADA\s+.*?,\s+NR\.\s+\d+[A-Z]*,\s+JUDETUL\s+[A-Z]+", RegexOptions.IgnoreCase) },
                    { "TaxID", new Regex(@"Cod Identificare Fiscala:\s*R\d+", RegexOptions.IgnoreCase) },
                    { "ProductLine", new Regex(@"\d{1,3}[.,]\d{3}\s+BUC\s+x\s+\d+[.,]\d{2}.*?(?:\n?.*?[A-Z].*)*", RegexOptions.IgnoreCase) },
                    { "Total", new Regex(@"TOTAL\s*\n?(\d+[.,]\d{2})", RegexOptions.IgnoreCase) },
                    { "VAT", new Regex(@"TOTAL TVA\s*\n?TVA B\s*\n?19.00%\s*\n?(\d+[.,]\d{2})", RegexOptions.IgnoreCase) },
                    { "Date", new Regex(@"DATA:\s*(\d{2}/\d{2}/\d{4})", RegexOptions.IgnoreCase) },
                    { "Time", new Regex(@"ORA:(\d{2}-\d{2}-\d{2})", RegexOptions.IgnoreCase) }
                }
            }
        };
    }
}
