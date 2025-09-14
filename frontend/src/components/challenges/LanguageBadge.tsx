import React from 'react';
import type { ChallengeLanguage } from '@/types/challenges';

interface LanguageBadgeProps {
  language: ChallengeLanguage | string;
  className?: string;
}

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({ 
  language, 
  className = '' 
}) => {
  const getLanguageStyles = (lang: ChallengeLanguage | string) => {
    const normalizedLang = typeof lang === 'string' ? lang.toLowerCase() : lang.toString();
    
    switch (normalizedLang) {
      case 'javascript':
      case '2':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'typescript':
      case '3':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'python':
      case '4':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'java':
      case '5':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'c#':
      case 'csharp':
      case '1':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'go':
      case '6':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'rust':
      case '7':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLanguageLabel = (lang: ChallengeLanguage | string) => {
    const normalizedLang = typeof lang === 'string' ? lang.toLowerCase() : lang.toString();
    
    switch (normalizedLang) {
      case 'javascript':
      case '2':
        return 'JavaScript';
      case 'typescript':
      case '3':
        return 'TypeScript';
      case 'python':
      case '4':
        return 'Python';
      case 'java':
      case '5':
        return 'Java';
      case 'c#':
      case 'csharp':
      case '1':
        return 'C#';
      case 'go':
      case '6':
        return 'Go';
      case 'rust':
      case '7':
        return 'Rust';
      default:
        return String(lang);
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLanguageStyles(
        language
      )} ${className}`}
    >
      {getLanguageLabel(language)}
    </span>
  );
};