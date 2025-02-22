namespace ReceiptsApp.Server.Services
{
    public enum MyRegexType
    {
        CompanyName,
        AddressLine
        // Add more types as needed
    }

    public class RegexPatterns
    {
         private static readonly Dictionary<MyRegexType, string> Patterns
        = new Dictionary<MyRegexType, string>
    {
        // Regex for the Company Name line
        {
            MyRegexType.CompanyName,
            // Explanation:
            // (?im):
            //   i = case-insensitive
            //   m = multiline (^/$ match line boundaries)
            // ^ start of line
            // (?:S\.?C\.?\s+)? => optional S.C. or SC + space
            // (?<companyName>.+?) => capture the main name into 'companyName'
            // \s+ => at least one space
            // (?:S\.?R\.?L\.?|SCS|SNC|S\.?A\.?) => the legal form
            // \s*$ => possible trailing whitespace until end of line
                @"(?im)^(?<companyName>(?:S\.?C\.?)\s+.*?\s+(?:S\.?R\.?L\.?|S\.?C\.?S\.?))$"
        },

        // Regex for the Address lines
        {
            MyRegexType.AddressLine,
            // Explanation:
            // (?im):
            //   i = case-insensitive
            //   m = multiline
            // ^ => start of line
            // (?! ... ) => negative lookahead ensuring the line does NOT start
            //             with 'CIF' or 'Cod de Identificare Fiscala'
            // (?<addressLine>.+)$ => capture everything else on that line
                @"(?im)^(?!C\.?I\.?F|CIF|Cod\s+Identificare\s+Fiscala)(?<addressLine>.+)$"
        }
    };

    // 2) Provide a helper method to retrieve the pattern by enum key.
    public static string GetPattern(MyRegexType regexType)
    {
        return Patterns[regexType];
    }

    }
}
