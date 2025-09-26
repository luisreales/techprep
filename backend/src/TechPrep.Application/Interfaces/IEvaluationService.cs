using TechPrep.Core.Entities;

namespace TechPrep.Application.Interfaces;

public interface IEvaluationService
{
    /// <summary>
    /// Normalizes input text by converting to lowercase, removing accents and punctuation
    /// </summary>
    string Normalize(string input);

    /// <summary>
    /// Calculates match percentage between user answer and official answer for written questions
    /// </summary>
    decimal CalculateMatchPercent(string userAnswer, string officialAnswer);

    /// <summary>
    /// Evaluates a single choice question answer
    /// </summary>
    bool EvaluateSingleChoice(Question question, List<Guid> selectedOptionIds);

    /// <summary>
    /// Evaluates a multiple choice question answer (all correct options must be selected, no extras)
    /// </summary>
    bool EvaluateMultiChoice(Question question, List<Guid> selectedOptionIds);

    /// <summary>
    /// Evaluates a written question answer using text matching
    /// </summary>
    (decimal matchPercent, bool isCorrect) EvaluateWritten(Question question, string userText, decimal threshold = 80m);
}