import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { practiceInterviewAdminApi } from '@/services/admin/practiceInterviewApi';
import { practiceApi } from '@/services/practiceApi';
import { interviewApi, creditsApi } from '@/services/interviewApi';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateGroupDto,
  UpdateGroupDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  StartPracticeDto,
  StartInterviewDto,
  SubmitAnswerDto,
  SessionStateDto,
  AuditEventDto,
  CreditTopUpDto,
  TemplateKind
} from '@/types/practiceInterview';

// Query Keys
export const practiceInterviewKeys = {
  all: ['practiceInterview'] as const,
  templates: () => [...practiceInterviewKeys.all, 'templates'] as const,
  template: (id: number) => [...practiceInterviewKeys.templates(), id] as const,
  groups: () => [...practiceInterviewKeys.all, 'groups'] as const,
  group: (id: number) => [...practiceInterviewKeys.groups(), id] as const,
  assignments: () => [...practiceInterviewKeys.all, 'assignments'] as const,
  assignment: (id: number) => [...practiceInterviewKeys.assignments(), id] as const,
  practiceSessions: () => [...practiceInterviewKeys.all, 'practiceSessions'] as const,
  practiceSession: (id: string) => [...practiceInterviewKeys.practiceSessions(), id] as const,
  interviewSessions: () => [...practiceInterviewKeys.all, 'interviewSessions'] as const,
  interviewSession: (id: string) => [...practiceInterviewKeys.interviewSessions(), id] as const,
  credits: () => [...practiceInterviewKeys.all, 'credits'] as const,
  creditHistory: () => [...practiceInterviewKeys.credits(), 'history'] as const
};

// Admin Template Hooks
export const useTemplates = (params: { page?: number; pageSize?: number; kind?: TemplateKind | '' } = {}) => {
  const { page = 1, pageSize = 10, kind } = params;
  return useQuery({
    queryKey: [...practiceInterviewKeys.templates(), { page, pageSize, kind }],
    queryFn: () => practiceInterviewAdminApi.getTemplates({ page, pageSize, kind: kind || undefined })
  });
};

export const useTemplate = (id: number) => {
  return useQuery({
    queryKey: practiceInterviewKeys.template(id),
    queryFn: () => practiceInterviewAdminApi.getTemplate(id),
    enabled: !!id
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => practiceInterviewAdminApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.templates() });
    }
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTemplateDto }) =>
      practiceInterviewAdminApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.template(id) });
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.templates() });
    }
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => practiceInterviewAdminApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.templates() });
    }
  });
};

export const useCloneTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      practiceInterviewAdminApi.cloneTemplate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.templates() });
    }
  });
};

// Admin Group Hooks
export const useGroups = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...practiceInterviewKeys.groups(), { page, pageSize }],
    queryFn: () => practiceInterviewAdminApi.getGroups(page, pageSize)
  });
};

export const useGroup = (id: number) => {
  return useQuery({
    queryKey: practiceInterviewKeys.group(id),
    queryFn: () => practiceInterviewAdminApi.getGroup(id),
    enabled: !!id
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupDto) => practiceInterviewAdminApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.groups() });
    }
  });
};

// Admin Assignment Hooks
export const useAssignments = (params: { page?: number; pageSize?: number; templateId?: number; groupId?: number } = {}) => {
  const { page = 1, pageSize = 10, templateId, groupId } = params;
  return useQuery({
    queryKey: [...practiceInterviewKeys.assignments(), { page, pageSize, templateId, groupId }],
    queryFn: () => practiceInterviewAdminApi.getAssignments({ page, pageSize, templateId, groupId })
  });
};

export const useAssignment = (id?: number) => {
  return useQuery({
    queryKey: practiceInterviewKeys.assignment(id ?? 0),
    queryFn: () => practiceInterviewAdminApi.getAssignment(id!),
    enabled: !!id
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssignmentDto) => practiceInterviewAdminApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.assignments() });
    }
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssignmentDto }) =>
      practiceInterviewAdminApi.updateAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.assignment(id) });
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.assignments() });
    }
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => practiceInterviewAdminApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.assignments() });
    }
  });
};

// Practice Session Hooks
export const useStartPractice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StartPracticeDto) => practiceApi.startPractice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.practiceSessions() });
    }
  });
};

export const usePracticeSession = (sessionId: string) => {
  return useQuery({
    queryKey: practiceInterviewKeys.practiceSession(sessionId),
    queryFn: () => practiceApi.getSession(sessionId),
    enabled: !!sessionId
  });
};

export const useSubmitPracticeAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SubmitAnswerDto }) =>
      practiceApi.submitAnswer(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.practiceSession(sessionId) });
    }
  });
};

export const useUpdatePracticeSessionState = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SessionStateDto }) =>
      practiceApi.updateSessionState(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.practiceSession(sessionId) });
    }
  });
};

export const useSubmitPractice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.submitPractice(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.practiceSessions() });
    }
  });
};

export const usePausePracticeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.pauseSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.practiceSession(sessionId) });
    }
  });
};

export const useResumePracticeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.resumeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.practiceSession(sessionId) });
    }
  });
};

// Interview Session Hooks
export const useStartInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StartInterviewDto) => interviewApi.startInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.interviewSessions() });
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.credits() });
    }
  });
};

export const useInterviewSession = (sessionId: string) => {
  return useQuery({
    queryKey: practiceInterviewKeys.interviewSession(sessionId),
    queryFn: () => interviewApi.getSession(sessionId),
    enabled: !!sessionId
  });
};

export const useSubmitInterviewAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SubmitAnswerDto }) =>
      interviewApi.submitAnswer(sessionId, data),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.interviewSession(sessionId) });
    }
  });
};

export const useSubmitInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => interviewApi.submitInterview(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.interviewSessions() });
    }
  });
};

export const useRecordAuditEvent = () => {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: AuditEventDto }) =>
      interviewApi.recordAuditEvent(sessionId, data)
  });
};

export const useInterviewCertificate = (sessionId: string) => {
  return useQuery({
    queryKey: [...practiceInterviewKeys.interviewSession(sessionId), 'certificate'],
    queryFn: () => interviewApi.getCertificate(sessionId),
    enabled: !!sessionId
  });
};

// Credits Hooks
export const useUserCredits = () => {
  return useQuery({
    queryKey: practiceInterviewKeys.credits(),
    queryFn: () => creditsApi.getUserCredits()
  });
};

export const useAddCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreditTopUpDto) => creditsApi.addCredits(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.credits() });
      queryClient.invalidateQueries({ queryKey: practiceInterviewKeys.creditHistory() });
    }
  });
};

export const useCreditHistory = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...practiceInterviewKeys.creditHistory(), { page, pageSize }],
    queryFn: () => creditsApi.getCreditHistory(page, pageSize)
  });
};
