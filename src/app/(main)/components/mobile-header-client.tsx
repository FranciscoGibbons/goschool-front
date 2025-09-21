"use client";

import { useState } from 'react';

export function MobileHeaderClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
      const isOpen = !isSidebarOpen;
      setIsSidebarOpen(isOpen);
      
      sidebar.classList.toggle('translate-x-0', isOpen);
      overlay.style.opacity = isOpen ? '1' : '0';
      overlay.style.pointerEvents = isOpen ? 'auto' : 'none';
    }
  };

  return (
    <header className="lg:hidden h-16 bg-background border-b border-gray-200 dark:border-gray-800 flex items-center px-4 fixed top-0 left-0 right-0 z-30">
      <button 
        className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="ml-4">
        <h1 className="text-lg font-semibold text-foreground">Stella Maris</h1>
      </div>
    </header>
  );
}