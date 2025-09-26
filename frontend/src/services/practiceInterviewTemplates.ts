import { api } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  TemplateDto,
  TemplateKind,
  UserAssignedTemplateDto
} from '@/types/practiceInterview';

const buildParams = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.append(k, String(v));
  });
  return search.toString();
};

export const practiceInterviewTemplatesApi = {
  list(kind: TemplateKind, page = 1, pageSize = 12) {
    const query = buildParams({ kind, page, pageSize });
    return api.get<ApiResponse<PaginatedResponse<TemplateDto>>>(`/templates?${query}`).then(r => r.data);
  },
  get(id: number) {
    return api.get<ApiResponse<TemplateDto>>(`/templates/${id}`).then(r => r.data);
  },
  listByUser(userId: string, kind?: TemplateKind, page = 1, pageSize = 12) {
    const query = buildParams({ kind, page, pageSize });
    return api.get<ApiResponse<PaginatedResponse<UserAssignedTemplateDto>>>(`/templates/user/${userId}?${query}`).then(r => r.data);
  },
};


export default practiceInterviewTemplatesApi;
