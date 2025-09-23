# Question Import Guide

## Overview
The TechPrep Question Bank now supports importing questions from Excel (.xlsx, .xls) and CSV files with comprehensive validation and preview functionality.

## File Format Requirements

### Required Columns
Your import file must include these exact column headers:

| Column | Description | Required | Format |
|--------|-------------|----------|--------|
| `Topic` | Question category/topic | Yes | Text (e.g., "JavaScript", "React") |
| `Level` | Difficulty level | Yes | `basic`, `intermediate`, or `advanced` |
| `Type` | Question type | Yes | `single_choice`, `multi_choice`, or `written` |
| `Text` | Question text | Yes | Text (the actual question) |
| `Options` | Answer options | For choice questions | Format: `A) Option 1;B) Option 2;C) Option 3` |
| `Correct` | Correct answers | For choice questions | Single: `A`, Multiple: `A;C;D` |
| `OfficialAnswer` | Official answer | For written questions | Text (detailed answer/explanation) |

### Question Type Specifics

#### Single Choice (`single_choice`)
- **Options**: Required, format: `A) First option;B) Second option;C) Third option`
- **Correct**: Required, single letter: `A`
- **OfficialAnswer**: Optional explanation

#### Multiple Choice (`multi_choice`)
- **Options**: Required, format: `A) First option;B) Second option;C) Third option`
- **Correct**: Required, multiple letters: `A;C` (semicolon separated)
- **OfficialAnswer**: Optional explanation

#### Written (`written`)
- **Options**: Leave empty or use empty string
- **Correct**: Leave empty or use empty string
- **OfficialAnswer**: Required, detailed answer expected from students

## Sample Files

### Test Files Available
1. **CSV Format**: `/public/sample-questions-import.csv`
2. **Excel Format**: `/public/sample-questions-import.xlsx`
3. **HTML Converter**: `/public/csv-to-excel-converter.html`

### Generate New Sample
To generate a fresh Excel sample file:
```bash
cd frontend
node generate-excel-sample.cjs
```

## Import Process

### Step 1: Upload
- Drag and drop or click to select your file
- Supports .xlsx, .xls, and .csv formats
- Maximum file size: 10MB

### Step 2: Preview
- Automatic parsing and validation
- Real-time error detection
- Data preview with validation status
- Statistics summary (valid/invalid questions)

### Step 3: Validate
- Server-side validation
- Duplicate detection
- Business rule validation
- Import ID generation

### Step 4: Confirm
- Final review of import summary
- Commit to database
- Success/error reporting

## Common Issues

### File Format Errors
- **Error**: "File type must be one of..."
- **Solution**: Ensure file has .xlsx, .xls, or .csv extension

### Column Header Errors
- **Error**: "Missing required column: Topic"
- **Solution**: Check column names match exactly (case-sensitive)

### Data Validation Errors
- **Level**: Must be exactly `basic`, `intermediate`, or `advanced`
- **Type**: Must be exactly `single_choice`, `multi_choice`, or `written`
- **Options**: For choice questions, use format `A) Text;B) Text;C) Text`
- **Correct**: For single choice use `A`, for multiple choice use `A;C;D`

### Performance Tips
- Keep files under 1000 questions for optimal performance
- Use descriptive topic names for better organization
- Ensure UTF-8 encoding for special characters

## Testing the Import

1. Navigate to Admin Panel → Question Bank
2. Click "Import Questions" button
3. Upload the sample file: `sample-questions-import.xlsx`
4. Follow the 4-step import process
5. Verify questions appear in the question bank

The sample file contains 10 questions covering various topics and question types for comprehensive testing.