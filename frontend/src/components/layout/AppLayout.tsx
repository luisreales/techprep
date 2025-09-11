import React from 'react';
import Sidebar from './Sidebar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex">
    <Sidebar isOpen={false} onClose={() => {}} />
    <main className="flex-1 p-4">{children}</main>
  </div>
);
