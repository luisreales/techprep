import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    {
      icon: 'event_repeat',
      value: '12',
      label: 'Total Sessions',
      iconBg: 'bg-[var(--primary-color-light)]',
      iconColor: 'text-[var(--primary-color)]',
    },
    {
      icon: 'military_tech',
      value: '78%',
      label: 'Average Score',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: 'schedule',
      value: '24h',
      label: 'Study Time',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: 'checklist',
      value: '8',
      label: 'Topics Covered',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
  ];

  const recentSessions = [
    {
      topic: 'JavaScript',
      details: '10 questions - 2024-01-15',
      score: '85%',
      color: 'text-[var(--accent-color)]',
    },
    {
      topic: 'React Hooks',
      details: '15 questions - 2024-01-12',
      score: '72%',
      color: 'text-amber-500',
    },
    {
      topic: 'CSS Grid',
      details: '5 questions - 2024-01-10',
      score: '55%',
      color: 'text-red-500',
    },
  ];

  const recommendations = [
    {
      heading: 'Needs Improvement',
      color: 'red',
      items: [{ name: 'CSS Grid', percent: 55 }],
    },
    {
      heading: 'Good Progress',
      color: 'amber',
      items: [{ name: 'React Hooks', percent: 72 }],
    },
    {
      heading: 'Strong Knowledge',
      color: 'green',
      items: [{ name: 'JavaScript', percent: 85 }],
    },
  ];

  const rootStyle: React.CSSProperties = {
    '--primary-color': '#4f46e5',
    '--primary-color-light': '#e0e7ff',
    '--background-color': '#f8fafc',
    '--text-primary': '#1e293b',
    '--text-secondary': '#64748b',
    '--card-background': '#ffffff',
    '--border-color': '#e2e8f0',
    '--accent-color': '#10b981',
  } as React.CSSProperties;

  return (
    <div className="flex flex-col min-h-screen" style={rootStyle}>
      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-64 shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:shadow-none lg:border-r border-[var(--border-color)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}
      >
        <div className="flex items-center gap-3 mb-10 p-2">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">TechPrep</span>
        </div>
        <nav className="flex flex-col h-[calc(100%-80px)]">
          <ul className="space-y-2 flex-grow">
            <li>
              <Link to="/dashboard" className="flex items-center p-3 rounded-lg bg-[var(--primary-color-light)] text-[var(--primary-color)] font-bold">
                <span className="material-symbols-outlined mr-3">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/practice" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-[var(--text-secondary)] font-medium transition-colors">
                <span className="material-symbols-outlined mr-3">model_training</span>
                Practice
              </Link>
            </li>
            <li>
              <Link to="/challenges" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-[var(--text-secondary)] font-medium transition-colors">
                <span className="material-symbols-outlined mr-3">code_blocks</span>
                Code Challenges
              </Link>
            </li>
            <li>
              <Link to="/resources" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-[var(--text-secondary)] font-medium transition-colors">
                <span className="material-symbols-outlined mr-3">auto_stories</span>
                Resources
              </Link>
            </li>
            <li>
              <Link to="/profile" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-[var(--text-secondary)] font-medium transition-colors">
                <span className="material-symbols-outlined mr-3">person</span>
                Profile
              </Link>
            </li>
          </ul>
          <div>
            <button onClick={handleLogout} className="flex w-full items-center p-3 rounded-lg hover:bg-gray-100 text-[var(--text-secondary)] font-medium transition-colors">
              <span className="material-symbols-outlined mr-3">logout</span>
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      <div
        id="sidebar-overlay"
        className={`fixed inset-0 bg-black/50 z-40 ${sidebarOpen ? '' : 'hidden'} lg:hidden`}
        onClick={toggleSidebar}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Header */}
        <header className="bg-[var(--card-background)]/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 border-b border-[var(--border-color)]">
              <button className="lg:hidden text-[var(--text-primary)]" onClick={toggleSidebar}>
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-[var(--text-primary)] lg:text-2xl">
                  Welcome Back{user?.firstName ? `, ${user.firstName}!` : '!'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                  <span className="material-symbols-outlined text-3xl">notifications</span>
                  <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-700 border-2 border-white shadow">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-[var(--card-background)] rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-3 ${s.iconBg}`}>
                    <span className={`material-symbols-outlined text-2xl ${s.iconColor}`}>{s.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/practice" className="text-left p-4 rounded-lg bg-[var(--primary-color-light)] hover:bg-indigo-200 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">rocket_launch</span>
                    <h3 className="font-bold text-lg text-[var(--primary-color)]">Start Practice Session</h3>
                  </div>
                  <p className="text-sm text-indigo-800/80">Jump into a new session based on your goals.</p>
                </Link>
                <Link to="/topics" className="text-left p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="material-symbols-outlined text-2xl text-[var(--text-secondary)]">search</span>
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">Browse Topics</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Explore all available topics and resources.</p>
                </Link>
              </div>
            </div>

            {/* Recent Sessions & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Sessions</h2>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{session.topic}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{session.details}</p>
                      </div>
                      <span className={`font-mono font-medium text-lg ${session.color}`}>{session.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recommended Study Areas</h2>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.heading}>
                      <h3 className={`font-semibold text-${rec.color}-600 mb-2`}>{rec.heading}</h3>
                      <div className="space-y-2">
                        {rec.items.map((item) => (
                          <div key={item.name}>
                            <div className="flex justify-between items-center text-sm">
                              <span>{item.name}</span>
                              <span className={`font-mono font-medium text-${rec.color}-600`}>{item.percent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`bg-${rec.color}-500 h-1.5 rounded-full`}
                                style={{ width: `${item.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
