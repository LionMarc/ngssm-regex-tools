using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using System.Text.Json;
using Smusdi.RegexTools;

namespace Smusdi.Wasm;

/// <summary>
/// Defines the list of methods that can be called from javascript.
/// </summary>
[SupportedOSPlatformAttribute("browser")]
public partial class RegexToolsApi
{
    [JSExport]
    public static string ValidateStringPartsExtractor(string input)
    {
        var extractor = JsonSerializer.Deserialize(input, SmusdiSerializationContext.Default.StringPartsExtractor);
        if (extractor == null)
        {
            throw new ArgumentException("Invalid input extractor", nameof(input));
        }

        var validationResult = extractor.Validate();
        return JsonSerializer.Serialize(validationResult, SmusdiSerializationContext.Default.StringPartsExtractorValidationResult);
    }

    [JSExport]
    public static string ValidateRegex(string input)
    {
        var validationResult = RegexHelpers.Validate(input);
        return JsonSerializer.Serialize(validationResult, SmusdiSerializationContext.Default.RegexValidationResult);
    }

    [JSExport]
    public static string ExtractParts(string serializedExtractor, string input)
    {
        var extractor = JsonSerializer.Deserialize(serializedExtractor, SmusdiSerializationContext.Default.StringPartsExtractor);
        if (extractor == null)
        {
            throw new ArgumentException("Invalid input extractor", nameof(serializedExtractor));
        }

        var extractionResult = extractor.ExtractPartsFrom(input);
        return JsonSerializer.Serialize(extractionResult, SmusdiSerializationContext.Default.StringPartsExtractionResult);
    }

    [JSExport]
    public static string[] GetGroupNames(string input)
    {
        var groups = RegexHelpers.GetDefinedGroupNames(input);
        return groups.ToArray();
    }

    [JSExport]
    public static bool IsMatch(string pattern, string input)
    {
        return RegexHelpers.IsMatch(pattern, input);
    }
}
