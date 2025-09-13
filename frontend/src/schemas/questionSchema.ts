import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string().uuid().optional(),
  topicId: z.number().int().positive(),
  topicName: z.string().min(1).optional(),
  text: z.string().min(10, 'Enter at least 10 characters'),
  type: z.enum(['single_choice', 'multi_choice', 'written']),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  officialAnswer: z.string().optional(),
  options: z.array(z.object({
    id: z.string().uuid().optional(),
    text: z.string().min(1),
    isCorrect: z.boolean().default(false),
    orderIndex: z.number().int().nonnegative().optional(),
  })).default([]),
  learningResources: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1),
    url: z.string().url(),
    description: z.string().optional(),
    createdAt: z.string().optional(),
  })).default([]),
});

// Refinements for type-specific rules
export const questionSchemaRefined = questionSchema.superRefine((val, ctx) => {
  if (val.type === 'written') {
    if (!val.officialAnswer || val.officialAnswer.trim().length < 10) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'Official answer required (≥10 chars) for written question', 
        path: ['officialAnswer'] 
      });
    }
  } else {
    if (val.options.length < 2) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'At least 2 options required', 
        path: ['options'] 
      });
    }
    const correct = val.options.filter(o => o.isCorrect).length;
    if (val.type === 'single_choice' && correct !== 1) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'Exactly one correct option is required', 
        path: ['options'] 
      });
    }
    if (val.type === 'multi_choice' && correct < 1) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'At least one correct option is required', 
        path: ['options'] 
      });
    }
  }
});

// Default values for new questions
export const questionDefaults = {
  id: crypto.randomUUID(),
  topicId: 0,
  topicName: '',
  text: '',
  type: 'single_choice' as const,
  level: 'basic' as const,
  officialAnswer: '',
  options: [
    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 1 },
    { id: crypto.randomUUID(), text: '', isCorrect: false, orderIndex: 2 },
  ],
  learningResources: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// TypeScript types
export type Question = z.infer<typeof questionSchema>;
export type QuestionFormData = z.infer<typeof questionSchemaRefined>;