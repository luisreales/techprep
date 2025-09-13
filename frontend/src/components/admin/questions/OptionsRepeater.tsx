import React from 'react';
import { useFieldArray, Control, useWatch } from 'react-hook-form';
import { QuestionFormData } from '@/schemas/questionSchema';
import { QuestionType } from '@/utils/enums';
import { GripVertical, X, Plus } from 'lucide-react';

interface OptionsRepeaterProps {
  control: Control<QuestionFormData>;
  questionType: QuestionType;
  errors?: any;
  setValue: (name: any, value: any) => void;
}

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const DragHandle: React.FC<DragHandleProps> = ({ onMouseDown }) => (
  <div
    className="flex items-center justify-center w-6 h-6 cursor-grab hover:bg-gray-100 rounded"
    onMouseDown={onMouseDown}
  >
    <GripVertical className="h-4 w-4 text-gray-400" />
  </div>
);

export const OptionsRepeater: React.FC<OptionsRepeaterProps> = ({
  control,
  questionType,
  errors,
  setValue,
}) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'options',
  });

  // Watch the options array to control radio button behavior
  const watchedOptions = useWatch({
    control,
    name: 'options',
  });

  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const addOption = () => {
    append({
      id: crypto.randomUUID(),
      text: '',
      isCorrect: false,
      orderIndex: fields.length + 1,
    });
  };

  // Handle single choice radio button selection
  const handleSingleChoiceChange = (selectedIndex: number) => {
    if (questionType === QuestionType.SingleChoice) {
      // Set all options to false first
      fields.forEach((_, index) => {
        setValue(`options.${index}.isCorrect`, false);
      });
      // Then set the selected one to true
      setValue(`options.${selectedIndex}.isCorrect`, true);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Update order indices
    fields.forEach((_, index) => {
      // This will be handled by the form submission
    });
  };

  const isSingleChoice = questionType === QuestionType.SingleChoice;
  const isMultiChoice = questionType === QuestionType.MultiChoice;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Options {isSingleChoice ? '(Single Choice)' : '(Multiple Choice)'}
        </label>
        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Option
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">No options added yet</p>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add First Option
          </button>
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Drag Handle */}
            <DragHandle onMouseDown={() => {}} />

            {/* Correct Answer Selector */}
            <div className="flex items-center pt-2">
              {isSingleChoice ? (
                <input
                  type="radio"
                  name="correctOption"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={Boolean(watchedOptions?.[index]?.isCorrect)}
                  onChange={() => handleSingleChoiceChange(index)}
                />
              ) : (
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...control.register(`options.${index}.isCorrect`)}
                />
              )}
            </div>

            {/* Option Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Option {index + 1}
                </span>
                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove option"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Enter option text..."
                className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors?.options?.[index]?.text
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                {...control.register(`options.${index}.text`)}
              />
              {errors?.options?.[index]?.text && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.options[index].text.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Validation Messages */}
      {errors?.options && (
        <div className="text-sm text-red-600">
          {typeof errors.options === 'object' && errors.options.message && (
            <p>{errors.options.message}</p>
          )}
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        {isSingleChoice && (
          <p>Select exactly one correct option for single choice questions.</p>
        )}
        {isMultiChoice && (
          <p>Select one or more correct options for multiple choice questions.</p>
        )}
        <p className="mt-1">Drag options to reorder them.</p>
      </div>
    </div>
  );
};