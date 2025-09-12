import React from 'react';

const Help: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Help & Support</h1>
        <p className="text-[var(--text-secondary)]">
          Find answers to common questions and get support for using TechPrep effectively.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Getting Started */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <span className="material-symbols-outlined text-xl text-blue-600">rocket_launch</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Getting Started</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">How to start practicing?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Go to Practice section, select your topic, difficulty level, and number of questions.</p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">What are practice modes?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Study mode gives immediate feedback, Interview mode simulates real interviews.</p>
            </div>
          </div>
        </div>

        {/* Practice Tips */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
              <span className="material-symbols-outlined text-xl text-green-600">tips_and_updates</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Practice Tips</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">How to improve my scores?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Practice regularly, review your answers, and use the resources section for learning.</p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">What is matching threshold?</h4>
              <p className="text-sm text-[var(--text-secondary)]">It's the minimum similarity percentage for written answers to be considered correct.</p>
            </div>
          </div>
        </div>

        {/* Technical Support */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100">
              <span className="material-symbols-outlined text-xl text-orange-600">support_agent</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Technical Support</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">Having login issues?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Try resetting your password or contact support if the problem persists.</p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">Questions not loading?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Check your internet connection and refresh the page. Clear browser cache if needed.</p>
            </div>
          </div>
        </div>

        {/* Account & Profile */}
        <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
              <span className="material-symbols-outlined text-xl text-purple-600">account_circle</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Account & Profile</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">How to update my profile?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Go to Profile section to update your personal information and preferences.</p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)] mb-1">Can I change my matching threshold?</h4>
              <p className="text-sm text-[var(--text-secondary)]">Yes, you can adjust it in your Profile settings (default is 80%).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-color-light)]">
              <span className="material-symbols-outlined text-2xl text-[var(--primary-color)]">contact_support</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Need More Help?</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <button className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-all duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;