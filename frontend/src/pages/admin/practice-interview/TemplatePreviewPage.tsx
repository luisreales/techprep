import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Clock, Shield, Award, CreditCard, Users, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useTemplate, useCloneTemplate } from '@/hooks/usePracticeInterview';
import { TemplateKind, VisibilityType, FeedbackMode, NavigationMode } from '@/types/practiceInterview';

export const TemplatePreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading, error } = useTemplate(id ? parseInt(id) : 0);
  const cloneTemplateMutation = useCloneTemplate();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-2 text-center text-gray-600">Loading template...</p>
      </div>
    );
  }

  if (error || !template?.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load template: {error?.message || 'Template not found'}</p>
        </div>
      </div>
    );
  }

  const t = template.data;

  const handleClone = async () => {
    try {
      await cloneTemplateMutation.mutateAsync({
        id: t.id,
        name: `${t.name} (Copy)`
      });
      navigate('/admin/practice-interview/templates');
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const getVisibilityColor = (visibility: VisibilityType) => {
    switch (visibility) {
      case VisibilityType.Public: return 'bg-blue-100 text-blue-800';
      case VisibilityType.Group: return 'bg-yellow-100 text-yellow-800';
      case VisibilityType.Private: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'No limit';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/practice-interview/templates')}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.name}</h1>
            <p className="text-gray-600 mt-1">Template Preview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/practice-interview/templates/${t.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleClone}
            disabled={cloneTemplateMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            {cloneTemplateMutation.isPending ? 'Cloning...' : 'Clone'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Template Type</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              t.kind === TemplateKind.Practice
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {t.kind}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Visibility</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVisibilityColor(t.visibilityDefault)}`}>
              {t.visibilityDefault}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
            <p className="text-sm text-gray-900">{new Date(t.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Question Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Question Selection
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Question Counts</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Single Choice:</span>
                <span className="text-sm font-medium">{t.selection.countSingle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Multiple Choice:</span>
                <span className="text-sm font-medium">{t.selection.countMulti}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Written:</span>
                <span className="text-sm font-medium">{t.selection.countWritten}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-900">Total:</span>
                <span className="text-sm font-bold">{t.selection.countSingle + t.selection.countMulti + t.selection.countWritten}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Selection Criteria</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Topics:</span>
                <p className="text-sm text-gray-900">
                  {t.selection.byTopics?.length > 0 ? t.selection.byTopics.join(', ') : 'Any topic'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Levels:</span>
                <p className="text-sm text-gray-900">
                  {t.selection.levels?.length > 0 ? t.selection.levels.join(', ') : 'Any level'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timers & Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timers & Navigation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Time Limits</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Time:</span>
                <span className="text-sm font-medium">{formatTime(t.timers.totalSec)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Per Question:</span>
                <span className="text-sm font-medium">{formatTime(t.timers.perQuestionSec)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Navigation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mode:</span>
                <span className="text-sm font-medium">{t.navigation.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Allow Pause:</span>
                <span className="text-sm font-medium">{t.navigation.allowPause ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Backtracks:</span>
                <span className="text-sm font-medium">{t.navigation.maxBacktracks || 'Unlimited'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Learning Aids */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Features & Learning Aids
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Feedback & Attempts</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Feedback Mode:</span>
                <span className="text-sm font-medium">{t.feedback.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Attempts:</span>
                <span className="text-sm font-medium">{t.attempts.max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cooldown:</span>
                <span className="text-sm font-medium">{t.attempts.cooldownHours}h</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Learning Aids</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Show Hints:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${t.aids.showHints ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {t.aids.showHints ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Show Sources:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${t.aids.showSources ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {t.aids.showSources ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Show Glossary:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${t.aids.showGlossary ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {t.aids.showGlossary ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Integrity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security & Integrity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Require Fullscreen', value: t.integrity.requireFullscreen },
            { label: 'Block Copy/Paste', value: t.integrity.blockCopyPaste },
            { label: 'Track Focus Loss', value: t.integrity.trackFocusLoss },
            { label: 'Proctoring', value: t.integrity.proctoring }
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.value ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion & Credits */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Completion & Credits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Certification</h3>
            <div className="flex items-center gap-3">
              {t.certification.enabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm text-gray-900">
                {t.certification.enabled ? 'Certificates will be generated' : 'No certificates'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Credit Cost</h3>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-bold text-gray-900">{t.credits.interviewCost}</span>
              <span className="text-sm text-gray-600">credits per interview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Template Summary */}
      {t.kind === TemplateKind.Interview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Interview Mode Restrictions</h3>
              <p className="text-sm text-amber-800">
                This template is configured for interview mode. Learning aids are disabled,
                feedback is only shown at the end, and pause functionality is restricted to maintain interview integrity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatePreviewPage;