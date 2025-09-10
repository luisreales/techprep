import React from 'react';
import { Link } from 'react-router-dom';

export const Sidebar: React.FC = () => (
  <aside className="w-48 p-4 bg-gray-100 h-screen">
    <nav className="space-y-2">
      <Link to="/dashboard" className="block">Dashboard</Link>
      <Link to="/practice" className="block">Practice</Link>
      <Link to="/challenges" className="block">Challenges</Link>
      <Link to="/resources" className="block">Resources</Link>
      <Link to="/admin" className="block">Admin</Link>
    </nav>
  </aside>
);
