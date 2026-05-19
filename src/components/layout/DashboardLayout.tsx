import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <div className="flex-1 flex min-h-0 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 min-h-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
