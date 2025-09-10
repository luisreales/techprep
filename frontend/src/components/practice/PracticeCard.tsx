import React, { useState } from 'react';
import type { Question } from '@/types';
import { percentMatch } from '@/utils/text';

interface Props {
  question: Question;
  onSubmit: (answer: { selectedOptionIds?: string[]; answer?: string }) => void;
  onNext?: () => void;
  threshold?: number;
}

export const PracticeCard: React.FC<Props> = ({
  question,
  onSubmit,
  onNext,
  threshold = 0.8,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = () => {
    if (question.type === 'written') {
      const match = percentMatch(question.officialAnswer ?? '', text);
      setFeedback(match >= threshold ? 'Correct' : 'Incorrect');
      onSubmit({ answer: text });
    } else if (question.type === 'single') {
      onSubmit({ selectedOptionIds: selected.slice(0, 1) });
    } else {
      onSubmit({ selectedOptionIds: selected });
    }
  };

  const toggleOption = (id: string, checked: boolean) => {
    setSelected((prev) => {
      if (question.type === 'single') {
        return checked ? [id] : [];
      }
      return checked ? [...prev, id] : prev.filter((o) => o !== id);
    });
  };

  return (
    <div className="p-4 border rounded">
      <p className="mb-4">{question.text}</p>
      {question.type === 'written' ? (
        <div>
          <textarea
            className="w-full border p-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {question.officialAnswer && (
            <p className="text-sm mt-1">
              Match: {percentMatch(question.officialAnswer, text).toFixed(0)}%
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {question.options.map((opt) => (
            <li key={opt.id}>
              <label className="flex items-center gap-2">
                <input
                  type={question.type === 'single' ? 'radio' : 'checkbox'}
                  name="option"
                  value={opt.id}
                  checked={selected.includes(opt.id)}
                  onChange={(e) => toggleOption(opt.id, e.target.checked)}
                />
                {opt.text}
              </label>
            </li>
          ))}
        </ul>
      )}
      {feedback && <p className="mt-2">{feedback}</p>}
      <div className="space-x-2 mt-4">
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
        {onNext && (
          <button onClick={onNext} className="px-4 py-2 bg-gray-200 rounded">
            Next
          </button>
        )}
      </div>
    </div>
  );
};
