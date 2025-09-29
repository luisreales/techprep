// Practice Interview System Types
// Corresponding to backend DTOs in TechPrep.Application.DTOs.PracticeInterview

// Enums
export enum TemplateKind {
  Practice = 1,
  Interview = 2
}

export enum VisibilityType {
  Public = 1,
  Group = 2,
  Private = 3
}

export enum FeedbackMode {
  Immediate = 1,
  End = 2,
  None = 3
}

export enum NavigationMode {
  Free = 1,
  Linear = 2,
  Restricted = 3
}

export enum SessionStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Paused = 'Paused',
  Completed = 'Completed',
  Expired = 'Expired',
  Abandoned = 'Abandoned'
}

export enum AuditEventType {
  FocusLoss = 'FocusLoss',
  WindowResize = 'WindowResize',
  TabSwitch = 'TabSwitch',
  DevToolsOpen = 'DevToolsOpen',
  CopyAttempt = 'CopyAttempt',
  PasteAttempt = 'PasteAttempt',
  FullscreenExit = 'FullscreenExit'
}

export enum CreditTransactionType {
  Purchase = 'Purchase',
  Consumption = 'Consumption',
  Refund = 'Refund',
  Bonus = 'Bonus'
}

// Selection Criteria Types
export interface SelectionCriteriaDto {
  byTopics: number[];
  levels: string[];
  countSingle: number;
  countMulti: number;
  countWritten: number;
}

// Configuration DTOs
export interface TimersDto {
  totalSec?: number;
  perQuestionSec?: number;
}

export interface NavigationDto {
  mode: NavigationMode;
  allowPause: boolean;
  maxBacktracks?: number;
}

export interface FeedbackDto {
  mode: FeedbackMode;
}

export interface AidsDto {
  showHints: boolean;
  showSources: boolean;
  showGlossary: boolean;
}

export interface AttemptsDto {
  max?: number;
  cooldownHours?: number;
}

export interface IntegrityDto {
  requireFullscreen: boolean;
  blockCopyPaste: boolean;
  trackFocusLoss: boolean;
  proctoring: boolean;
}

export interface CertificationDto {
  enabled: boolean;
}

export interface CreditsDto {
  interviewCost: number;
}

// Template DTOs
export interface TemplateDto {
  id: number;
  name: string;
  description?: string;
  kind: TemplateKind;
  visibilityDefault: VisibilityType;
  selection: SelectionCriteriaDto;
  timers: TimersDto;
  navigation: NavigationDto;
  feedback: FeedbackDto;
  aids: AidsDto;
  attempts: AttemptsDto;
  integrity: IntegrityDto;
  certification: CertificationDto;
  credits: CreditsDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  kind: TemplateKind;
  visibilityDefault: VisibilityType;
  selection: SelectionCriteriaDto;
  timers: TimersDto;
  navigation: NavigationDto;
  feedback: FeedbackDto;
  aids: AidsDto;
  attempts: AttemptsDto;
  integrity: IntegrityDto;
  certification: CertificationDto;
  credits: CreditsDto;
}

export interface UpdateTemplateDto extends CreateTemplateDto {}

export interface UserAssignedTemplateDto extends TemplateDto {
  assignmentId: number;
}

// Group DTOs
export interface GroupDto {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupDetailDto extends GroupDto {
  members: GroupMemberDto[];
}

export interface GroupMemberDto {
  userId: string;
  userName: string;
  email: string;
  joinedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
}

export interface UpdateGroupDto extends CreateGroupDto {}

// Assignment DTOs
export interface AssignmentDto {
  id: number;
  templateId: number;
  templateName: string;
  templateKind: TemplateKind;
  groupId?: number;
  groupName?: string;
  userId?: string;
  userName?: string;
  visibility: VisibilityType;
  startsAt?: string;
  endsAt?: string;
  maxAttempts?: number;
  createdAt: string;
}

export interface CreateAssignmentDto {
  templateId: number;
  groupId?: number;
  userId?: string;
  visibility: VisibilityType;
  startsAt?: string;
  endsAt?: string;
  maxAttempts?: number;
}

export interface UpdateAssignmentDto extends CreateAssignmentDto {}

// Session DTOs
export interface PracticeSessionDto {
  id: string;
  name: string;
  assignmentId: number;
  assignmentName?: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  currentQuestionState?: string;
  totalScore?: number;
  totalTimeSec?: number;
  startedAt: string;
  submittedAt?: string;
  pausedAt?: string;
  finishedAt?: string;
  answers: PracticeAnswerDto[];
  topics?: Array<{
    id: string;
    name: string;
    levels: string;
  }>;
  levels?: string;
  topicId?: string;
  topicName?: string;
  questionCount?: number;
  totalItems?: number;
  correctCount?: number;
  incorrectCount?: number;
}

export interface InterviewSessionDto {
  id: string;
  assignmentId: number;
  assignmentName: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  totalScore?: number;
  totalTimeSec?: number;
  startedAt: string;
  submittedAt?: string;
  answers: InterviewAnswerDto[];
  certificateIssued: boolean;
}

// Answer DTOs
export interface PracticeAnswerDto {
  id: string;
  questionId: string;
  questionText: string;
  selectedOptionIds?: string[];
  givenText?: string;
  isCorrect?: boolean;
  score?: number;
  timeSpentSec: number;
  answeredAt: string;
  explanation?: string;
  suggestedResources?: string[];
}

export interface InterviewAnswerDto {
  id: string;
  questionId: string;
  questionText: string;
  selectedOptionIds?: string[];
  givenText?: string;
  isCorrect?: boolean;
  score?: number;
  timeSpentSec: number;
  answeredAt: string;
}

// Request DTOs
export interface StartPracticeDto {
  assignmentId: number;
}

export interface StartDirectPracticeDto {
  name: string;
  topicId?: number; // Keep for backward compatibility
  topicIds?: number[]; // New field for multiple topics
  level?: string;
  questionCount: number;
}

export interface StartInterviewDto {
  assignmentId: number;
}

export interface SubmitAnswerDto {
  questionId: string;
  selectedOptionIds?: string[];
  givenText?: string;
  timeSpentSec: number;
}

export interface SessionStateDto {
  currentQuestionIndex: number;
  currentQuestionState?: string;
}

export interface AuditEventDto {
  eventType: AuditEventType;
  meta?: Record<string, any>;
}

// Credit DTOs
export interface CreditLedgerDto {
  id: string;
  transactionType: CreditTransactionType;
  credits: number;
  description: string;
  expiresAt?: string;
  interviewSessionId?: string;
  createdAt: string;
}

export interface UserCreditsDto {
  availableCredits: number;
  recentTransactions: CreditLedgerDto[];
  nextExpiration?: string;
}

export interface CreditTopUpDto {
  credits: number;
  expiresAt?: string;
}

// Certificate DTOs
export interface CertificateDto {
  id: string;
  userName: string;
  templateName: string;
  totalScore: number;
  certificateNumber: string;
  verificationUrl: string;
  qrCodeData: string;
  issuedAt: string;
  completedAt: string;
  isValid: boolean;
}

// Common DTOs
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
