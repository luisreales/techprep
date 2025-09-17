import { http } from '@/utils/axios';

export interface MetricPoint {
  date: string;
  sessions: number;
  finishes: number;
}

export interface TopicAccuracy {
  topic: string;
  accuracy: number;
  total: number;
}

export interface AdminMetricsDto {
  users: number;
  questions: number;
  challenges: number;
  topics: number;
  sessionsLast30d: number;
  avgAccuracyLast30d: number;
  avgSessionMinutesLast30d: number;
  activity14d: MetricPoint[];
  topTopics: TopicAccuracy[];
}

export const adminMetricsApi = {
  getGlobal: () =>
    http.get<AdminMetricsDto>('/admin/metrics/global').then(r => r.data),
};