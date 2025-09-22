import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import {
  useAssignment,
  useCreateAssignment,
  useUpdateAssignment,
  useTemplates,
  useGroups
} from '@/hooks/usePracticeInterview';
import { TemplateKind, VisibilityType, CreateAssignmentDto, UpdateAssignmentDto } from '@/types/practiceInterview';

interface FormData {
  templateId: number | '';
  visibility: VisibilityType;
  groupId?: number | '';
  userId?: string;
  startsAt?: string;
  endsAt?: string;
  maxAttempts?: number | '';
}

const toLocalInputValue = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toISOString = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const AssignmentFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const assignmentId = id ? Number(id) : undefined;
  const isEditing = Boolean(assignmentId);
  const navigate = useNavigate();

  const { data: assignmentResponse, isLoading: isAssignmentLoading } = useAssignment(assignmentId);
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();

  const { data: templatesResponse, isLoading: templatesLoading } = useTemplates({ page: 1, pageSize: 100 });
  const { data: groupsResponse, isLoading: groupsLoading } = useGroups(1, 100);

  const templates = templatesResponse?.data?.data ?? [];
  const groups = groupsResponse?.data?.data ?? [];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      templateId: '',
      visibility: VisibilityType.Public,
      groupId: '',
      userId: '',
      startsAt: '',
      endsAt: '',
      maxAttempts: ''
    }
  });

  const watchedVisibility = watch('visibility');

  useEffect(() => {
    if (assignmentResponse?.data && isEditing) {
      const assignment = assignmentResponse.data;
      setValue('templateId', assignment.templateId);
      setValue('visibility', assignment.visibility);
      setValue('groupId', assignment.groupId ?? '');
      setValue('userId', assignment.userId ?? '');
      setValue('startsAt', toLocalInputValue(assignment.startsAt));
      setValue('endsAt', toLocalInputValue(assignment.endsAt));
      setValue('maxAttempts', assignment.maxAttempts ?? '');
    }
  }, [assignmentResponse, isEditing, setValue]);

  const onSubmit = async (formData: FormData) => {
    if (!formData.templateId) {
      return;
    }

    const payload: CreateAssignmentDto | UpdateAssignmentDto = {
      templateId: Number(formData.templateId),
      visibility: formData.visibility,
      groupId: formData.visibility === VisibilityType.Group && formData.groupId ? Number(formData.groupId) : undefined,
      userId: formData.visibility === VisibilityType.Private ? formData.userId || undefined : undefined,
      startsAt: toISOString(formData.startsAt),
      endsAt: toISOString(formData.endsAt),
      maxAttempts: formData.maxAttempts === '' ? undefined : Number(formData.maxAttempts)
    };

    try {
      if (isEditing && assignmentId) {
        await updateAssignment.mutateAsync({ id: assignmentId, data: payload });
      } else {
        await createAssignment.mutateAsync(payload);
      }
      navigate('/admin/practice-interview/assignments');
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  const templateOptions = templates.map((template) => ({
    value: template.id,
    label: `${template.name} (${template.kind === TemplateKind.Practice ? 'Practice' : 'Interview'})`
  }));

  const groupOptions = groups.map((group) => ({ value: group.id, label: group.name }));

  const isLoading = (isEditing && isAssignmentLoading) || templatesLoading || groupsLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/practice-interview/assignments')}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Assignment' : 'Create Assignment'}
          </h1>
          <p className="text-gray-600 mt-1">
            Control who has access to a specific practice or interview template.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template *
              </label>
              <Controller
                name="templateId"
                control={control}
                rules={{ required: 'Template is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a template</option>
                    {templateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.templateId && (
                <p className="mt-1 text-sm text-red-600">{errors.templateId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility *
              </label>
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={VisibilityType.Public}>Public (all students)</option>
                    <option value={VisibilityType.Group}>Group</option>
                    <option value={VisibilityType.Private}>Private (specific user)</option>
                  </select>
                )}
              />
            </div>

            {watchedVisibility === VisibilityType.Group && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Group *
                </label>
                <Controller
                  name="groupId"
                  control={control}
                  rules={{ required: 'Group is required for group visibility' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a group</option>
                      {groupOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.groupId && (
                  <p className="mt-1 text-sm text-red-600">{errors.groupId.message}</p>
                )}
              </div>
            )}

            {watchedVisibility === VisibilityType.Private && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID or Email *
                </label>
                <Controller
                  name="userId"
                  control={control}
                  rules={{ required: 'User identifier is required for private visibility' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter user ID or email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Window</label>
              <Controller
                name="startsAt"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Window</label>
              <Controller
                name="endsAt"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Attempts</label>
              <Controller
                name="maxAttempts"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
              <p className="mt-1 text-sm text-gray-500">Leave blank for unlimited attempts.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createAssignment.isPending || updateAssignment.isPending}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {createAssignment.isPending || updateAssignment.isPending ? 'Saving...' : 'Save Assignment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignmentFormPage;
