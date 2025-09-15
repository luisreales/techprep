import { z } from 'zod';
import { ResourceKind, ResourceDifficulty } from '@/types/resources';

export const resourceSchema = z.object({
  id: z.number().int().positive().optional(),
  kind: z.nativeEnum(ResourceKind),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  url: z.string().url('Please enter a valid URL'),
  author: z.string().optional(),
  duration: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  description: z.string().optional(),
  difficulty: z.nativeEnum(ResourceDifficulty).optional(),
  questionIds: z.array(z.string()).default([]),
  topicIds: z.array(z.number().int().positive()).default([]),
});

export type ResourceFormData = z.infer<typeof resourceSchema>;

export const resourceDefaults: ResourceFormData = {
  kind: ResourceKind.Article,
  title: '',
  url: '',
  author: '',
  duration: '',
  rating: undefined,
  description: '',
  difficulty: ResourceDifficulty.Basic,
  questionIds: [],
  topicIds: [],
};

// Helper functions to convert duration
export const formatDuration = (duration?: string): string => {
  if (!duration) return '';
  
  // If it's already in HH:MM:SS format, return as is
  if (duration.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return duration;
  }
  
  // If it's in ISO 8601 format (PT45M), convert to HH:MM:SS
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (match) {
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return duration;
};

export const parseDuration = (duration: string): string => {
  if (!duration) return '';
  
  // If it's in HH:MM:SS format, return as is (backend accepts both formats)
  if (duration.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return duration;
  }
  
  return duration;
};