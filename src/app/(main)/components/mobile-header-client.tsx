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
    <header className="lg:hidden h-16 bg-background/98 backdrop-blur-lg border-b border-border/20 flex items-center px-4 fixed top-0 left-0 right-0 z-30 shadow-sm supports-[backdrop-filter]:bg-background/80">
      <button 
        className="p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-accent/50 transition-colors"
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