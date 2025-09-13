import { z } from 'zod';

export const excelRowSchema = z.object({
  Topic: z.string().min(1, 'Topic is required'),
  Level: z.enum(['basic', 'intermediate', 'advanced']).default('basic'),
  Type: z.enum(['single_choice', 'multi_choice', 'written']),
  Text: z.string().min(5, 'Text must be at least 5 characters'),
  Options: z.string().optional().default(''),
  Correct: z.string().optional().default(''),
  OfficialAnswer: z.string().optional().default('')
}).superRefine((v, ctx) => {
  if (v.Type === 'written') {
    // Written questions require official answer
    if (!v.OfficialAnswer || v.OfficialAnswer.trim().length < 5) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ['OfficialAnswer'], 
        message: 'OfficialAnswer required (≥5 chars) for written questions'
      });
    }
  } else {
    // Single/Multi choice questions need options and correct answers
    const options = (v.Options ?? '').split(';').map(s => s.trim()).filter(Boolean);
    if (options.length < 2) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ['Options'], 
        message: 'Minimum 2 options required for single/multi choice questions' 
      });
    }
    
    const correctAnswers = new Set(
      (v.Correct ?? '').split(';')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean)
    );
    
    if (v.Type === 'single_choice' && correctAnswers.size !== 1) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ['Correct'], 
        message: 'Single choice requires exactly 1 correct answer (A, B, etc.)' 
      });
    }
    
    if (v.Type === 'multi_choice' && correctAnswers.size < 1) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        path: ['Correct'], 
        message: 'Multi choice requires ≥1 correct answers (A;C;etc.)' 
      });
    }

    // Validate that correct letters exist in options
    const optionLetters = new Set(
      options.map((_, index) => String.fromCharCode(65 + index)) // A, B, C, D...
    );
    
    for (const letter of correctAnswers) {
      if (!optionLetters.has(letter)) {
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          path: ['Correct'], 
          message: `Correct answer '${letter}' does not match available options` 
        });
      }
    }
  }
});

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedRow {
  row: number;
  parsed: z.infer<typeof excelRowSchema>;
  errors: ImportError[];
  isValid: boolean;
}

export interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  byType: {
    single_choice: number;
    multi_choice: number;
    written: number;
  };
}

export interface ImportValidationResponse {
  success: boolean;
  data: {
    importId: string;
    summary: ImportSummary;
    preview: ParsedRow[];
  };
  message: string;
}

export interface ImportCommitResponse {
  success: boolean;
  data: {
    inserted: number;
    skipped: number;
    errors: ImportError[];
  };
  message: string;
}

export type ExcelRowData = z.infer<typeof excelRowSchema>;