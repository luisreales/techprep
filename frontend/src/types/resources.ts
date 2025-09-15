export enum ResourceKind {
  Book = 'Book',
  Video = 'Video',
  Article = 'Article'
}

export enum ResourceDifficulty {
  Basic = 'Basic',
  Medium = 'Medium',  
  Hard = 'Hard'
}

export interface LearningResource {
  id: number;
  kind: ResourceKind;
  title: string;
  url: string;
  author?: string;
  duration?: string;
  rating?: number;
  description?: string;
  difficulty?: ResourceDifficulty;
  createdAt: string;
  updatedAt?: string;
}

export interface ResourceCreateDto {
  kind: string;
  title: string;
  url: string;
  author?: string;
  duration?: string;
  rating?: number;
  description?: string;
  difficulty?: string;
  questionIds?: string[];
  topicIds?: number[];
}

export interface ResourceUpdateDto {
  kind: string;
  title: string;
  url: string;
  author?: string;
  duration?: string;
  rating?: number;
  description?: string;
  difficulty?: string;
  questionIds?: string[];
  topicIds?: number[];
}

export interface ResourceListItem {
  id: number;
  kind: string;
  title: string;
  url: string;
  author?: string;
  rating?: number;
  difficulty?: string;
  createdAt: string;
  topics: string[];
}

export interface ResourceDetail {
  id: number;
  kind: string;
  title: string;
  url: string;
  author?: string;
  duration?: string;
  rating?: number;
  description?: string;
  difficulty?: string;
  questionIds: string[];
  topics: string[];
}

export interface ResourceFilters {
  kind?: ResourceKind;
  topicId?: number;
  difficulty?: ResourceDifficulty;
  search?: string;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}