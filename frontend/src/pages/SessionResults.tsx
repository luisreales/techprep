import React, { useState } from 'react';

interface TopicResults {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
}

const SessionResults: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topicResults: TopicResults[] = [
    {
      topic: 'Data Structures',
      total: 50,
      correct: 45,
      wrong: 5,
      percentage: 90
    },
    {
      topic: 'Algorithms',
      total: 40,
      correct: 30,
      wrong: 10,
      percentage: 75
    },
    {
      topic: 'System Design',
      total: 30,
      correct: 24,
      wrong: 6,
      percentage: 80
    },
    {
      topic: 'Behavioral',
      total: 30,
      correct: 21,
      wrong: 9,
      percentage: 70
    }
  ];

  const totalStats = {
    total: topicResults.reduce((sum, topic) => sum + topic.total, 0),
    correct: topicResults.reduce((sum, topic) => sum + topic.correct, 0),
    wrong: topicResults.reduce((sum, topic) => sum + topic.wrong, 0),
    percentage: Math.round(
      (topicResults.reduce((sum, topic) => sum + topic.correct, 0) / 
       topicResults.reduce((sum, topic) => sum + topic.total, 0)) * 100
    )
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-[#f0f5fa]" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className={`relative flex min-h-screen flex-row ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar */}
        <aside className={`bg-white w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full z-30 shadow-lg lg:translate-x-0 lg:static lg:shadow-none`}>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[#137fec]">TechPrep</h1>
          </div>
          <nav className="mt-8 flex flex-col gap-2 px-4">
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" href="#">
              <span className="material-symbols-outlined">model_training</span>
              <span className="font-medium">Practice</span>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" href="#">
              <span className="material-symbols-outlined">code</span>
              <span className="font-medium">Code Challenges</span>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" href="#">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="font-medium">Resources</span>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" href="#">
              <span className="material-symbols-outlined">person</span>
              <span className="font-medium">Profile</span>
            </a>
            <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100" href="#">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="font-medium">Admin</span>
            </a>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 ease-in-out lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header for mobile */}
          <header className="bg-white sticky top-0 z-10 shadow-sm lg:hidden">
            <div className="flex items-center p-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-gray-900"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="text-gray-900 text-lg font-bold flex-1 text-center pr-6">
                Interview Summary
              </h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4 sm:p-6 flex-1">
            {/* Title for desktop */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-gray-900 text-2xl font-bold">Interview Summary</h1>
            </div>

            {/* Results Table */}
            <section className="mb-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3" scope="col">Topic/Level</th>
                        <th className="px-6 py-3 text-center" scope="col">Total</th>
                        <th className="px-6 py-3 text-center" scope="col">Correct</th>
                        <th className="px-6 py-3 text-center" scope="col">Wrong</th>
                        <th className="px-6 py-3 text-center" scope="col">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicResults.map((result, index) => (
                        <tr key={result.topic} className="bg-white border-b">
                          <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row">
                            {result.topic}
                          </th>
                          <td className="px-6 py-4 text-center">{result.total}</td>
                          <td className="px-6 py-4 text-center">{result.correct}</td>
                          <td className="px-6 py-4 text-center">{result.wrong}</td>
                          <td className={`px-6 py-4 text-center font-semibold ${getPercentageColor(result.percentage)}`}>
                            {result.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="font-semibold text-gray-900">
                        <th className="px-6 py-3 text-base" scope="row">Total</th>
                        <td className="px-6 py-3 text-center">{totalStats.total}</td>
                        <td className="px-6 py-3 text-center">{totalStats.correct}</td>
                        <td className="px-6 py-3 text-center">{totalStats.wrong}</td>
                        <td className="px-6 py-3 text-center text-[#137fec]">{totalStats.percentage}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </section>

            {/* Performance Trends Chart */}
            <section className="mb-8">
              <h2 className="text-gray-900 text-xl font-bold mb-4">Performance Trends</h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="h-64">
                  <svg className="w-full h-full" fill="none" height="100%" viewBox="0 0 400 250" width="100%" xmlns="http://www.w3.org/2000/svg">
                    {/* Data Structure Bar - 90% */}
                    <rect fill="#4ade80" height="155" width="60" x="50" y="45"></rect>
                    {/* Algorithms Bar - 75% */}
                    <rect fill="#4ade80" height="130" width="60" x="130" y="70"></rect>
                    {/* System Design Bar - 80% */}
                    <rect fill="#4ade80" height="140" width="60" x="210" y="60"></rect>
                    {/* Behavioral Bar - 70% */}
                    <rect fill="#fb923c" height="115" width="60" x="290" y="85"></rect>
                    
                    {/* Base line */}
                    <line stroke="#e5e7eb" strokeWidth="2" x1="40" x2="360" y1="200" y2="200"></line>
                    
                    {/* X-axis labels */}
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="70" y="220">Data Struct.</text>
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="150" y="220">Algorithms</text>
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="225" y="220">Sys. Design</text>
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="305" y="220">Behavioral</text>
                    
                    {/* Percentage labels on bars */}
                    <text fill="#111827" fontFamily="Inter" fontSize="14" fontWeight="bold" x="80" y="40">90%</text>
                    <text fill="#111827" fontFamily="Inter" fontSize="14" fontWeight="bold" x="160" y="65">75%</text>
                    <text fill="#111827" fontFamily="Inter" fontSize="14" fontWeight="bold" x="240" y="55">80%</text>
                    <text fill="#111827" fontFamily="Inter" fontSize="14" fontWeight="bold" x="320" y="80">70%</text>
                    
                    {/* Y-axis */}
                    <line stroke="#e5e7eb" strokeWidth="2" x1="40" x2="40" y1="200" y2="20"></line>
                    
                    {/* Y-axis labels */}
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="10" y="205">0%</text>
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="10" y="115">50%</text>
                    <text fill="#6b7280" fontFamily="Inter" fontSize="12" x="10" y="25">100%</text>
                    
                    {/* Y-axis tick marks */}
                    <line stroke="#e5e7eb" strokeWidth="2" x1="35" x2="45" y1="112.5" y2="112.5"></line>
                    <line stroke="#e5e7eb" strokeWidth="2" x1="35" x2="45" y1="20" y2="20"></line>
                  </svg>
                </div>
              </div>
            </section>

            {/* Download Button */}
            <div className="flex justify-center mt-8 mb-4">
              <button className="flex w-full max-w-sm items-center justify-center gap-2 rounded-lg h-12 px-6 bg-[#137fec] text-white text-base font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined">download</span>
                <span>Download Unsolved CSV</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SessionResults;