import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api';

interface UserStats {
  totalQuestions: number;
  correctAnswers: number;
  overallProgress: number;
  dailyStreak: number;
  topicProgress: Array<{
    name: string;
    progress: number;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const [stats, setStats] = useState<UserStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    overallProgress: 0,
    dailyStreak: 0,
    topicProgress: []
  });
  const [selectedMode, setSelectedMode] = useState<'study' | 'interview'>('study');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Mock data for demonstration - replace with API call
    setStats({
      totalQuestions: 150,
      correctAnswers: 120,
      overallProgress: 70,
      dailyStreak: 12,
      topicProgress: [
        { name: '.NET', progress: 45 },
        { name: 'Angular', progress: 80 },
        { name: 'React', progress: 60 },
        { name: 'JavaScript', progress: 75 }
      ]
    });
  }, []);

  const handleStartPractice = () => {
    navigate('/practice', { 
      state: { 
        mode: selectedMode, 
        difficulty: selectedDifficulty 
      } 
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const progressData = [
    { month: 'Jan', accuracy: 50 },
    { month: 'Feb', accuracy: 65 },
    { month: 'Mar', accuracy: 60 },
    { month: 'Apr', accuracy: 75 },
    { month: 'May', accuracy: 85 }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] font-['Inter',sans-serif]">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-700">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <span className="text-xl font-bold text-[#111827]">{user?.firstName || 'User'}</span>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center p-3 rounded-md bg-[#137fec]/10 text-[#137fec] font-semibold"
              >
                <span className="material-symbols-outlined mr-3">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/practice"
                className="flex items-center p-3 rounded-md hover:bg-gray-100 text-[#6b7280] font-medium"
              >
                <span className="material-symbols-outlined mr-3">model_training</span>
                Practice
              </Link>
            </li>
            <li>
              <Link
                to="/challenges"
                className="flex items-center p-3 rounded-md hover:bg-gray-100 text-[#6b7280] font-medium"
              >
                <span className="material-symbols-outlined mr-3">code</span>
                Code Challenges
              </Link>
            </li>
            <li>
              <Link
                to="/resources"
                className="flex items-center p-3 rounded-md hover:bg-gray-100 text-[#6b7280] font-medium"
              >
                <span className="material-symbols-outlined mr-3">source</span>
                Resources
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="flex items-center p-3 rounded-md hover:bg-gray-100 text-[#6b7280] font-medium"
              >
                <span className="material-symbols-outlined mr-3">person</span>
                Profile
              </Link>
            </li>
            {user?.role === 'Admin' && (
              <li>
                <Link
                  to="/admin"
                  className="flex items-center p-3 rounded-md hover:bg-gray-100 text-[#6b7280] font-medium"
                >
                  <span className="material-symbols-outlined mr-3">admin_panel_settings</span>
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white sticky top-0 z-30 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                className="lg:hidden text-[#111827]"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
              <h1 className="text-xl font-bold text-[#111827] lg:text-2xl">Dashboard</h1>
              <div className="flex items-center gap-4">
                <button className="relative text-[#6b7280] hover:text-[#137fec]">
                  <span className="material-symbols-outlined text-3xl">notifications</span>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-[#6b7280] hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-3xl">logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Progress */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
                <h2 className="text-lg font-semibold text-[#111827] mb-4">Overall Progress</h2>
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="10"
                    />
                    <circle
                      className="text-[#137fec] transition-all duration-300"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="45"
                      stroke="currentColor"
                      strokeDasharray="282.743"
                      strokeDashoffset={282.743 - (282.743 * stats.overallProgress) / 100}
                      strokeLinecap="round"
                      strokeWidth="10"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#111827]">{stats.overallProgress}%</span>
                  </div>
                </div>
                <p className="text-sm text-[#6b7280] mt-2">Great job! Keep it up.</p>
              </div>

              {/* Daily Streak */}
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
                <h2 className="text-lg font-semibold text-[#111827] mb-4">Daily Practice Streak</h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-5xl text-orange-400">local_fire_department</span>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#111827]">{stats.dailyStreak}</p>
                    <p className="text-sm text-[#6b7280]">days</p>
                  </div>
                </div>
                <p className="text-sm text-[#6b7280] mt-4">You're on fire! Keep practicing daily.</p>
              </div>
            </div>

            {/* Topics Progress & Performance Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Topics Progress */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-[#111827] mb-4">Select Topics</h2>
                <div className="space-y-4">
                  {stats.topicProgress.map((topic, index) => (
                    <div key={index} className="p-4 rounded-lg border border-[#e5e7eb]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-base text-[#111827]">{topic.name}</span>
                        <span className="text-sm font-medium text-[#6b7280]">{topic.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#137fec] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Trends */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-[#111827] mb-4">Performance Trends</h2>
                <div className="h-48">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <line stroke="#e5e7eb" strokeWidth="1" x1="10" x2="190" y1="90" y2="90" />
                    <line stroke="#e5e7eb" strokeWidth="1" x1="10" x2="10" y1="10" y2="90" />
                    
                    {/* X-axis labels */}
                    {progressData.map((item, index) => (
                      <text key={index} fill="#6b7280" fontSize="6" textAnchor="middle" x={10 + index * 45} y="98">
                        {item.month}
                      </text>
                    ))}
                    
                    {/* Y-axis labels */}
                    <text fill="#6b7280" fontSize="6" textAnchor="end" x="5" y="70">50%</text>
                    <text fill="#6b7280" fontSize="6" textAnchor="end" x="5" y="45">75%</text>
                    <text fill="#6b7280" fontSize="6" textAnchor="end" x="5" y="20">100%</text>
                    
                    {/* Line and points */}
                    <polyline
                      fill="none"
                      points={progressData.map((item, index) => `${10 + index * 45},${90 - item.accuracy}`).join(' ')}
                      stroke="#137fec"
                      strokeWidth="2"
                    />
                    {progressData.map((item, index) => (
                      <circle
                        key={index}
                        cx={10 + index * 45}
                        cy={90 - item.accuracy}
                        fill="#137fec"
                        r="2"
                      />
                    ))}
                  </svg>
                </div>
                <p className="text-xs text-center text-[#6b7280] mt-2">Accuracy Over Time</p>
              </div>
            </div>

            {/* Start New Session */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-[#111827] mb-4">Start a New Session</h2>
              <div className="space-y-6">
                {/* Mode Selection */}
                <div>
                  <h3 className="text-base font-medium text-[#6b7280] mb-3">Choose Your Mode</h3>
                  <div className="flex bg-[#f0f2f5] rounded-lg p-1">
                    <label className="flex-1 text-center py-2 rounded-md cursor-pointer has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-[#137fec] font-semibold text-sm transition-all duration-200">
                      <input
                        type="radio"
                        name="mode"
                        value="study"
                        checked={selectedMode === 'study'}
                        onChange={(e) => setSelectedMode(e.target.value as 'study')}
                        className="sr-only"
                      />
                      Study
                    </label>
                    <label className="flex-1 text-center py-2 rounded-md cursor-pointer has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:text-[#137fec] font-semibold text-sm transition-all duration-200">
                      <input
                        type="radio"
                        name="mode"
                        value="interview"
                        checked={selectedMode === 'interview'}
                        onChange={(e) => setSelectedMode(e.target.value as 'interview')}
                        className="sr-only"
                      />
                      Interview
                    </label>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <h3 className="text-base font-medium text-[#6b7280] mb-3">Difficulty Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {['basic', 'intermediate', 'advanced'].map((difficulty) => (
                      <label
                        key={difficulty}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer has-[:checked]:border-[#137fec] has-[:checked]:bg-[#137fec]/5 transition-all duration-200"
                      >
                        <input
                          type="radio"
                          name="difficulty"
                          value={difficulty}
                          checked={selectedDifficulty === difficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value as 'basic' | 'intermediate' | 'advanced')}
                          className="sr-only"
                        />
                        <span className="font-semibold text-sm text-[#111827] capitalize">
                          {difficulty === 'intermediate' ? 'Medium' : difficulty}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartPractice}
                  className="w-full flex items-center justify-center gap-2 bg-[#137fec] text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-200"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  <span>Start Practice</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;