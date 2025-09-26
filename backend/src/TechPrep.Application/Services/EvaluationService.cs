using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using TechPrep.Application.Interfaces;
using TechPrep.Core.Entities;
using TechPrep.Core.Enums;

namespace TechPrep.Application.Services;

public class EvaluationService : IEvaluationService
{
    private static readonly HashSet<string> StopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        // English stop words
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "will", "with",
        // Spanish stop words
        "el", "la", "de", "que", "y", "a", "en", "un", "es", "se", "no", "te", "lo", "le", "da", "su", "por", "son", "con", "para", "una", "las", "del", "los"
    };

    public string Normalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Convert to lowercase
        var normalized = input.ToLowerInvariant();

        // Remove accents
        normalized = RemoveAccents(normalized);

        // Remove punctuation and extra spaces, keep only letters, numbers and single spaces
        normalized = Regex.Replace(normalized, @"[^\w\s]", " ");
        normalized = Regex.Replace(normalized, @"\s+", " ");

        return normalized.Trim();
    }

    public decimal CalculateMatchPercent(string userAnswer, string officialAnswer)
    {
        if (string.IsNullOrWhiteSpace(userAnswer) || string.IsNullOrWhiteSpace(officialAnswer))
            return 0m;

        var normalizedUser = Normalize(userAnswer);
        var normalizedOfficial = Normalize(officialAnswer);

        // Extract keywords (minimum 2 characters, filter stop words)
        var userKeywords = ExtractKeywords(normalizedUser);
        var officialKeywords = ExtractKeywords(normalizedOfficial);

        if (!officialKeywords.Any())
            return 0m;

        // Calculate match percentage
        var matchedKeywords = userKeywords.Intersect(officialKeywords, StringComparer.OrdinalIgnoreCase).Count();
        var totalOfficialKeywords = officialKeywords.Count;

        return Math.Round((decimal)matchedKeywords / totalOfficialKeywords * 100, 2);
    }

    public bool EvaluateSingleChoice(Question question, List<Guid> selectedOptionIds)
    {
        if (question.Type != QuestionType.SingleChoice)
            return false;

        if (selectedOptionIds == null || selectedOptionIds.Count != 1)
            return false;

        var selectedOptionId = selectedOptionIds.First();
        var correctOption = question.Options.FirstOrDefault(o => o.Id == selectedOptionId && o.IsCorrect);

        return correctOption != null;
    }

    public bool EvaluateMultiChoice(Question question, List<Guid> selectedOptionIds)
    {
        if (question.Type != QuestionType.MultiChoice)
            return false;

        if (selectedOptionIds == null)
            selectedOptionIds = new List<Guid>();

        var correctOptionIds = question.Options
            .Where(o => o.IsCorrect)
            .Select(o => o.Id)
            .ToHashSet();

        var selectedSet = selectedOptionIds.ToHashSet();

        // Must select all correct options and no incorrect ones
        return correctOptionIds.SetEquals(selectedSet);
    }

    public (decimal matchPercent, bool isCorrect) EvaluateWritten(Question question, string userText, decimal threshold = 80m)
    {
        if (question.Type != QuestionType.Written)
            return (0m, false);

        if (string.IsNullOrWhiteSpace(question.OfficialAnswer))
            return (0m, false);

        var matchPercent = CalculateMatchPercent(userText, question.OfficialAnswer);
        var isCorrect = matchPercent >= threshold;

        return (matchPercent, isCorrect);
    }

    private static string RemoveAccents(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }

    private static HashSet<string> ExtractKeywords(string normalizedText)
    {
        if (string.IsNullOrWhiteSpace(normalizedText))
            return new HashSet<string>();

        return normalizedText
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(word => word.Length >= 2 && !StopWords.Contains(word))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }
}