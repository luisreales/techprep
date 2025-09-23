using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPrep.Application.Interfaces;
using TechPrep.Application.DTOs;
using TechPrep.Core.Enums;
using System.Collections.Concurrent;
using OfficeOpenXml;

namespace TechPrep.API.Controllers.Admin;

[ApiController]
[Route("api/admin/imports")]
// [Authorize(Roles = "Admin")] // Temporarily disabled for testing
public class ImportController : ControllerBase
{
    private readonly IQuestionService _questionService;
    private static readonly ConcurrentDictionary<string, ImportSession> _importSessions = new();
    private static readonly Dictionary<string, int> _topicCache = new();

    public ImportController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    private class ImportSession
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public List<ExcelRowData> ValidRows { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    private class ExcelRowData
    {
        public string Topic { get; set; } = string.Empty;
        public string Level { get; set; } = "basic";
        public string Type { get; set; } = "single_choice";
        public string Text { get; set; } = string.Empty;
        public string Options { get; set; } = string.Empty;
        public string Correct { get; set; } = string.Empty;
        public string OfficialAnswer { get; set; } = string.Empty;
    }

    [HttpPost("questions/validate")]
    public async Task<IActionResult> ValidateQuestions(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No file provided"
                });
            }

            // Validate file type and size
            var allowedExtensions = new[] { ".xlsx", ".xls", ".csv" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid file format. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed."
                });
            }

            const long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (file.Length > maxFileSize)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "File size exceeds maximum allowed size (10MB)."
                });
            }

            // Parse Excel file
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var preview = new List<object>();
            var summary = new
            {
                total = 0,
                valid = 0,
                invalid = 0,
                byType = new
                {
                    single_choice = 0,
                    multi_choice = 0,
                    written = 0
                }
            };

            var importId = Guid.NewGuid().ToString();
            var validRows = new List<ExcelRowData>();
            
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                List<List<string>> allRows;

                if (fileExtension == ".csv")
                {
                    // Handle CSV files
                    stream.Position = 0;
                    using var reader = new StreamReader(stream);
                    var csvContent = await reader.ReadToEndAsync();
                    allRows = ParseCsvContent(csvContent);
                }
                else
                {
                    // Handle Excel files
                    using var package = new ExcelPackage(stream);
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();

                    if (worksheet == null)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "No worksheet found in Excel file"
                        });
                    }

                    allRows = ParseExcelWorksheet(worksheet);
                }

                if (allRows.Count < 2) // Header + at least 1 data row
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "File must contain header row and at least one data row"
                    });
                }

                // Parse rows (skip header)
                var totalRows = 0;
                var validCount = 0;
                var singleChoiceCount = 0;
                var multiChoiceCount = 0;
                var writtenCount = 0;

                for (int row = 1; row < Math.Min(allRows.Count, 51); row++) // Limit to 50 data rows + header for preview
                {
                    totalRows++;
                    var currentRow = allRows[row];
                    var rowData = new ExcelRowData
                    {
                        Topic = GetCellValue(currentRow, 0),
                        Level = GetCellValue(currentRow, 1)?.ToLower() ?? "basic",
                        Type = GetCellValue(currentRow, 2)?.ToLower() ?? "single_choice",
                        Text = GetCellValue(currentRow, 3),
                        Options = GetCellValue(currentRow, 4),
                        Correct = GetCellValue(currentRow, 5),
                        OfficialAnswer = GetCellValue(currentRow, 6)
                    };

                    var errors = new List<object>();
                    var isValid = ValidateRowData(rowData, errors);
                    
                    if (isValid)
                    {
                        validCount++;
                        validRows.Add(rowData);
                        
                        switch (rowData.Type)
                        {
                            case "single_choice": singleChoiceCount++; break;
                            case "multi_choice": multiChoiceCount++; break;
                            case "written": writtenCount++; break;
                        }
                    }

                    preview.Add(new
                    {
                        row = row,
                        parsed = rowData,
                        errors = errors,
                        isValid = isValid
                    });
                }

                summary = new
                {
                    total = totalRows,
                    valid = validCount,
                    invalid = totalRows - validCount,
                    byType = new
                    {
                        single_choice = singleChoiceCount,
                        multi_choice = multiChoiceCount,
                        written = writtenCount
                    }
                };

                // Store valid rows for commit
                _importSessions[importId] = new ImportSession
                {
                    Id = importId,
                    ValidRows = validRows
                };
                
                Console.WriteLine($"[VALIDATE] Stored session {importId} with {validRows.Count} valid rows");
                foreach (var row in validRows.Take(3)) // Log first 3 rows as sample
                {
                    Console.WriteLine($"[VALIDATE] Sample row: {row.Text} | Type: {row.Type} | Level: {row.Level}");
                }
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    importId = importId,
                    summary = summary,
                    preview = preview
                },
                message = "File validated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to validate Excel file",
                error = new { code = "VALIDATION_ERROR", message = ex.Message }
            });
        }
    }

    [HttpPost("questions/commit")]
    public async Task<IActionResult> CommitImport([FromQuery] string importId)
    {
        Console.WriteLine($"[COMMIT] Received commit request for importId: {importId}");
        Console.WriteLine($"[COMMIT] Import sessions count: {_importSessions.Count}");
        Console.WriteLine($"[COMMIT] Available session IDs: {string.Join(", ", _importSessions.Keys)}");
        
        try
        {
            if (string.IsNullOrEmpty(importId))
            {
                Console.WriteLine("[COMMIT ERROR] ImportId is null or empty");
                return BadRequest(new
                {
                    success = false,
                    message = "ImportId is required"
                });
            }

            if (!_importSessions.TryGetValue(importId, out var session))
            {
                Console.WriteLine($"[COMMIT ERROR] Session not found for importId: {importId}");
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid or expired import session"
                });
            }

            Console.WriteLine($"[COMMIT] Found session with {session.ValidRows.Count} valid rows");

            var inserted = 0;
            var skipped = 0;
            var errors = new List<object>();

            // Convert and insert valid rows into database
            foreach (var row in session.ValidRows)
            {
                Console.WriteLine($"[COMMIT] Processing row: {row.Text}");
                try
                {
                    // Check for duplicate question by text
                    var existingQuestion = await _questionService.GetQuestionByTextAsync(row.Text);
                    if (existingQuestion != null)
                    {
                        Console.WriteLine($"[COMMIT] Skipping duplicate question: {row.Text}");
                        skipped++;
                        continue;
                    }

                    // Convert ExcelRowData to CreateQuestionDto
                    var createQuestionDto = new CreateQuestionDto
                    {
                        TopicId = GetOrCreateTopicId(row.Topic),
                        Text = row.Text,
                        Type = ParseQuestionType(row.Type),
                        Level = ParseDifficultyLevel(row.Level),
                        OfficialAnswer = row.OfficialAnswer,
                        Options = ParseOptions(row.Options, row.Correct, row.Type),
                        LearningResources = new List<CreateLearningResourceDto>()
                    };

                    Console.WriteLine($"[COMMIT] Calling _questionService.CreateQuestionAsync for: {createQuestionDto.Text}");

                    // Call the question service to create the question
                    var createdQuestion = await _questionService.CreateQuestionAsync(createQuestionDto);
                    inserted++;

                    Console.WriteLine($"[COMMIT] Successfully created question with ID: {createdQuestion.Id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[COMMIT ERROR] Failed to create question: {ex.Message}");
                    Console.WriteLine($"[COMMIT ERROR] Stack trace: {ex.StackTrace}");
                    errors.Add(new
                    {
                        row = row.Text,
                        error = ex.Message
                    });
                    skipped++;
                }
            }

            Console.WriteLine($"[COMMIT] Final results - Inserted: {inserted}, Skipped: {skipped}, Errors: {errors.Count}");

            // Clean up session
            _importSessions.TryRemove(importId, out _);

            return Ok(new
            {
                success = true,
                data = new
                {
                    inserted = inserted,
                    skipped = skipped,
                    errors = errors
                },
                message = $"Import completed. {inserted} questions imported, {skipped} skipped."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to commit import",
                error = new { code = "COMMIT_ERROR", message = ex.Message }
            });
        }
    }

    private bool ValidateRowData(ExcelRowData row, List<object> errors)
    {
        var isValid = true;

        // Required fields
        if (string.IsNullOrWhiteSpace(row.Topic))
        {
            errors.Add(new { field = "Topic", message = "Topic is required" });
            isValid = false;
        }

        if (string.IsNullOrWhiteSpace(row.Text) || row.Text.Length < 5)
        {
            errors.Add(new { field = "Text", message = "Question text is required (minimum 5 characters)" });
            isValid = false;
        }

        // Validate level
        var validLevels = new[] { "basic", "intermediate", "advanced" };
        if (!validLevels.Contains(row.Level.ToLower()))
        {
            errors.Add(new { field = "Level", message = "Level must be basic, intermediate, or advanced" });
            isValid = false;
        }

        // Validate type
        var validTypes = new[] { "single_choice", "multi_choice", "written" };
        if (!validTypes.Contains(row.Type.ToLower()))
        {
            errors.Add(new { field = "Type", message = "Type must be single_choice, multi_choice, or written" });
            isValid = false;
        }

        // Type-specific validation
        if (row.Type.ToLower() == "written")
        {
            if (string.IsNullOrWhiteSpace(row.OfficialAnswer) || row.OfficialAnswer.Length < 5)
            {
                errors.Add(new { field = "OfficialAnswer", message = "Official answer is required for written questions (minimum 5 characters)" });
                isValid = false;
            }
        }
        else
        {
            // Validate options and correct answers for choice questions
            var options = row.Options.Split(';', StringSplitOptions.RemoveEmptyEntries);
            if (options.Length < 2)
            {
                errors.Add(new { field = "Options", message = "At least 2 options required for choice questions" });
                isValid = false;
            }

            var correctAnswers = row.Correct.Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Select(c => c.Trim().ToUpper()).ToHashSet();

            if (row.Type.ToLower() == "single_choice" && correctAnswers.Count != 1)
            {
                errors.Add(new { field = "Correct", message = "Single choice questions must have exactly one correct answer" });
                isValid = false;
            }

            if (row.Type.ToLower() == "multi_choice" && correctAnswers.Count < 1)
            {
                errors.Add(new { field = "Correct", message = "Multiple choice questions must have at least one correct answer" });
                isValid = false;
            }

            // Validate that correct letters match available options
            var optionLetters = options.Select((_, index) => ((char)('A' + index)).ToString()).ToHashSet();
            foreach (var correct in correctAnswers)
            {
                if (!optionLetters.Contains(correct))
                {
                    errors.Add(new { field = "Correct", message = $"Correct answer '{correct}' does not match available options" });
                    isValid = false;
                }
            }
        }

        return isValid;
    }

    [HttpGet("template")]
    public IActionResult DownloadTemplate()
    {
        try
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Questions Template");

            // Headers
            worksheet.Cells[1, 1].Value = "Topic";
            worksheet.Cells[1, 2].Value = "Level";
            worksheet.Cells[1, 3].Value = "Type";
            worksheet.Cells[1, 4].Value = "Text";
            worksheet.Cells[1, 5].Value = "Options";
            worksheet.Cells[1, 6].Value = "Correct";
            worksheet.Cells[1, 7].Value = "OfficialAnswer";

            // Sample data
            worksheet.Cells[2, 1].Value = "JavaScript";
            worksheet.Cells[2, 2].Value = "basic";
            worksheet.Cells[2, 3].Value = "single_choice";
            worksheet.Cells[2, 4].Value = "What is a closure in JavaScript?";
            worksheet.Cells[2, 5].Value = "A) Function;B) Variable;C) Loop;D) Object";
            worksheet.Cells[2, 6].Value = "A";
            worksheet.Cells[2, 7].Value = "";

            // Format headers
            using (var range = worksheet.Cells[1, 1, 1, 7])
            {
                range.Style.Font.Bold = true;
                range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            worksheet.Cells.AutoFitColumns();

            var content = package.GetAsByteArray();
            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Questions_Template.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = "Failed to generate template",
                error = new { code = "TEMPLATE_ERROR", message = ex.Message }
            });
        }
    }

    private int GetOrCreateTopicId(string topicName)
    {
        // Check cache first
        if (_topicCache.TryGetValue(topicName, out int cachedTopicId))
        {
            return cachedTopicId;
        }

        // For now, return a default topic ID (1)
        // In a full implementation, you would:
        // 1. Check if topic exists in database
        // 2. Create new topic if it doesn't exist
        // 3. Return the topic ID
        _topicCache[topicName] = 1; // Default topic ID
        return 1;
    }

    private List<CreateQuestionOptionDto> ParseOptions(string options, string correct, string questionType)
    {
        var optionsList = new List<CreateQuestionOptionDto>();

        if (string.IsNullOrEmpty(options))
            return optionsList;

        // Split options by semicolon
        var optionParts = options.Split(';', StringSplitOptions.RemoveEmptyEntries);
        
        // Parse correct answers
        var correctAnswers = new HashSet<string>(
            (correct ?? "").Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Select(c => c.Trim().ToUpperInvariant())
        );

        for (int i = 0; i < optionParts.Length; i++)
        {
            var optionText = optionParts[i].Trim();
            
            // Remove the letter prefix (A), B), etc.) if present
            if (optionText.Length > 2 && char.IsLetter(optionText[0]) && optionText[1] == ')')
            {
                optionText = optionText.Substring(2).Trim();
            }

            var optionLetter = ((char)('A' + i)).ToString();
            var isCorrect = correctAnswers.Contains(optionLetter);

            optionsList.Add(new CreateQuestionOptionDto
            {
                Text = optionText,
                IsCorrect = isCorrect,
                OrderIndex = i + 1
            });
        }

        return optionsList;
    }

    private QuestionType ParseQuestionType(string type)
    {
        return type.ToLower().Trim() switch
        {
            "single_choice" => QuestionType.SingleChoice,
            "multi_choice" => QuestionType.MultiChoice,
            "written" => QuestionType.Written,
            _ => throw new ArgumentException($"Invalid question type: {type}")
        };
    }

    private DifficultyLevel ParseDifficultyLevel(string level)
    {
        return level.ToLower().Trim() switch
        {
            "basic" => DifficultyLevel.Basic,
            "intermediate" => DifficultyLevel.Intermediate,
            "advanced" => DifficultyLevel.Advanced,
            _ => throw new ArgumentException($"Invalid difficulty level: {level}")
        };
    }

    private List<List<string>> ParseCsvContent(string csvContent)
    {
        var rows = new List<List<string>>();
        var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        foreach (var line in lines)
        {
            var cells = new List<string>();
            var currentCell = "";
            var inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    cells.Add(currentCell.Trim());
                    currentCell = "";
                }
                else
                {
                    currentCell += c;
                }
            }

            // Add the last cell
            cells.Add(currentCell.Trim());
            rows.Add(cells);
        }

        return rows;
    }

    private List<List<string>> ParseExcelWorksheet(OfficeOpenXml.ExcelWorksheet worksheet)
    {
        var rows = new List<List<string>>();
        var rowCount = worksheet.Dimension?.Rows ?? 0;

        for (int row = 1; row <= rowCount; row++)
        {
            var cells = new List<string>();
            for (int col = 1; col <= 7; col++) // 7 columns expected
            {
                cells.Add(worksheet.Cells[row, col].Text?.Trim() ?? "");
            }
            rows.Add(cells);
        }

        return rows;
    }

    private string GetCellValue(List<string> row, int columnIndex)
    {
        if (columnIndex < 0 || columnIndex >= row.Count)
            return "";

        return row[columnIndex]?.Trim() ?? "";
    }
}