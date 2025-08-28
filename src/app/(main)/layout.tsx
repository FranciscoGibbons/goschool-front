'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from "../components/sidebar/Sidebar";
import userInfoStore from "@/store/userInfoStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { checkAuth, isLoading } = userInfoStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error verifying authentication:', error);
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Mobile sidebar overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300" 
        style={{
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 300ms ease-in-out'
        }}
        id="sidebar-overlay"
      />
      
      {/* Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 -translate-x-full bg-background border-r border-gray-200 dark:border-gray-800 overflow-y-auto h-screen"
        id="sidebar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
        }}
      >
        <Sidebar className="h-full" />
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64 w-full min-h-screen bg-background">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-background border-b border-gray-200 dark:border-gray-800 flex items-center px-4 fixed top-0 left-0 right-0 z-30">
          <button 
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            onClick={() => {
              const sidebar = document.getElementById('sidebar');
              const overlay = document.getElementById('sidebar-overlay');
              if (sidebar && overlay) {
                sidebar.classList.toggle('translate-x-0');
                overlay.style.opacity = overlay.style.opacity === '1' ? '0' : '1';
                overlay.style.pointerEvents = overlay.style.opacity === '1' ? 'auto' : 'none';
              }
            }}
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
        
        {/* Page content */}
        <main className="flex-1 pt-16 lg:pt-0 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
