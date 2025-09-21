import React, { useState, useRef, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  Play, 
  Save, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Code2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Settings,
  RotateCcw
} from 'lucide-react';
import { useChallenge, useSubmitAttempt, useChallengeProgress, useLatestAttempt } from '@/hooks/useChallenges';
import { DifficultyBadge } from '@/components/challenges/DifficultyBadge';
import { LanguageBadge } from '@/components/challenges/LanguageBadge';
import { TagBadge } from '@/components/challenges/TagBadge';
import { ProgressIndicator } from '@/components/challenges/ProgressIndicator';
import type { TestCase, TestResult } from '@/types/challenges';

interface ChallengeEditorProps {
  initialCode?: string;
  language: string;
  onCodeChange: (code: string) => void;
  readOnly?: boolean;
}

const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
  initialCode = '',
  language,
  onCodeChange,
  readOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = code.substring(0, start) + '  ' + code.substring(end);
        setCode(newValue);
        onCodeChange(newValue);
        
        // Set cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Code Editor</span>
          <LanguageBadge language={language} />
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleCodeChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        placeholder={`// Write your ${language} solution here...`}
        spellCheck={false}
      />
    </div>
  );
};

interface TestResultsProps {
  results: TestResult[];
  isRunning: boolean;
}

const TestResults: React.FC<TestResultsProps> = ({ results, isRunning }) => {
  if (isRunning) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
        <span className="text-gray-600">Running tests...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Click "Run Tests" to see results
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <div
          key={result.testCaseId || index}
          className={`p-3 rounded-lg border ${
            result.passed
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Test Case {index + 1}
            </span>
            {result.passed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          {!result.passed && result.error && (
            <div className="mt-2">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-600 font-mono bg-red-100 p-2 rounded mt-1">
                {result.error}
              </p>
            </div>
          )}
          
          {result.actualOutput && (
            <div className="mt-2">
              <p className="text-sm text-gray-700">Output:</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                {result.actualOutput}
              </p>
            </div>
          )}
          
          {result.executionTime && (
            <div className="mt-2 text-xs text-gray-500">
              Execution time: {result.executionTime}ms
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const challengeId = id ? parseInt(id) : 0;

  // State
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [notes, setNotes] = useState('');

  // Hooks
  const { data: challenge, isLoading, error } = useChallenge(challengeId);
  const { data: latestAttempt } = useLatestAttempt(challengeId);
  const { hasAttempted, getBestScore, isCompleted } = useChallengeProgress();
  const submitAttempt = useSubmitAttempt();

  // Set initial code when latest attempt loads
  React.useEffect(() => {
    if (latestAttempt && !userCode) {
      // Set initial code from latest attempt if available
      setUserCode(latestAttempt.notes || '');
    }
  }, [latestAttempt, userCode]);

  // Mock test cases parsing (replace with actual implementation)
  const testCases: TestCase[] = React.useMemo(() => {
    if (!challenge?.testsJson) return [];
    
    try {
      return JSON.parse(challenge.testsJson);
    } catch {
      return [];
    }
  }, [challenge?.testsJson]);

  const handleRunTests = useCallback(async () => {
    if (!userCode.trim()) return;

    setIsRunningTests(true);
    try {
      // Mock test execution - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results
      const mockResults: TestResult[] = testCases.map((testCase, index) => ({
        testCaseId: testCase.id || index.toString(),
        passed: Math.random() > 0.3, // 70% pass rate for demo
        actualOutput: `Output for test ${index + 1}`,
        executionTime: Math.floor(Math.random() * 100) + 10,
        error: Math.random() > 0.7 ? undefined : `Runtime error in test ${index + 1}`,
      }));
      
      setTestResults(mockResults);
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  }, [userCode, testCases]);

  const handleSubmitSolution = useCallback(async () => {
    if (!userCode.trim()) return;

    const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);
    const score = testResults.length > 0 ? (testResults.filter(r => r.passed).length / testResults.length) * 100 : 0;

    try {
      await submitAttempt.mutateAsync({
        challengeId,
        payload: {
          submittedCode: userCode,
          markSolved: allTestsPassed,
          score: Math.round(score),
          notes: notes || userCode,
        },
      });
    } catch (error) {
      console.error('Failed to submit solution:', error);
    }
  }, [challengeId, userCode, testResults, notes, submitAttempt]);

  const resetCode = () => {
    setUserCode('');
    setTestResults([]);
    setNotes('');
  };

  if (!challengeId) {
    return <Navigate to="/challenges" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mr-3"></div>
        <span className="text-gray-600">Loading challenge...</span>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">Challenge not found</p>
          <p className="text-gray-500 mt-2">The challenge you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const challengeHasAttempted = hasAttempted(challengeId);
  const challengeIsCompleted = isCompleted(challengeId);
  const challengeBestScore = getBestScore(challengeId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <LanguageBadge language={challenge.language} />
                <DifficultyBadge difficulty={challenge.difficulty} />
                {challenge.tags.map((tag: any) => {
                  // Handle both string tags and tag objects
                  const tagName = typeof tag === 'string' ? tag : tag.name;
                  const tagKey = typeof tag === 'string' ? tag : `${tag.id}-${tag.name}`;
                  const tagColor = typeof tag === 'string' ? undefined : tag.color;
                  return (
                    <TagBadge key={tagKey} tag={tagName} color={tagColor} />
                  );
                })}
              </div>
            </div>
            
            <ProgressIndicator
              hasAttempted={challengeHasAttempted}
              isCompleted={challengeIsCompleted}
              bestScore={challengeBestScore}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{challenge.prompt}</p>
              </div>
            </div>

            {/* Test Cases (Public ones) */}
            {testCases.filter(tc => !tc.isHidden).length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Test Cases</h3>
                <div className="space-y-4">
                  {testCases.filter(tc => !tc.isHidden).map((testCase, index) => (
                    <div key={testCase.id || index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Input:</span>
                          <pre className="text-sm font-mono bg-white p-2 rounded mt-1 overflow-x-auto">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Expected Output:</span>
                          <pre className="text-sm font-mono bg-white p-2 rounded mt-1 overflow-x-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                        {testCase.description && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Description:</span>
                            <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Solution (if available and user has completed) */}
            {challenge.hasSolution && challenge.officialSolution && challengeIsCompleted && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Official Solution</h3>
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    {showSolution ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showSolution ? 'Hide' : 'Show'} Solution
                  </button>
                </div>
                {showSolution && (
                  <ChallengeEditor
                    initialCode={challenge.officialSolution}
                    language={challenge.language}
                    onCodeChange={() => {}} // Read-only
                    readOnly
                  />
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor and Test Results */}
          <div className="space-y-6">
            {/* Code Editor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Solution</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetCode}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>
              <ChallengeEditor
                initialCode={userCode}
                language={challenge.language}
                onCodeChange={setUserCode}
              />
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handleRunTests}
                  disabled={!userCode.trim() || isRunningTests}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunningTests ? 'Running...' : 'Run Tests'}
                </button>
                
                <button
                  onClick={handleSubmitSolution}
                  disabled={!userCode.trim() || submitAttempt.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {submitAttempt.isPending ? 'Submitting...' : 'Submit Solution'}
                </button>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
              <TestResults results={testResults} isRunning={isRunningTests} />
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your notes about this challenge..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;