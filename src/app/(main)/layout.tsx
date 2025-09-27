import Sidebar from "../components/sidebar/Sidebar";
import { MobileHeaderClient } from './components/mobile-header-client';
import BottomNavbar from '@/components/BottomNavbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El middleware ya se encarga de la verificación de autenticación
  // No necesitamos verificar aquí para evitar conflictos
  
  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Mobile sidebar overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300 opacity-0 pointer-events-none" 
        id="sidebar-overlay"
      />
      
      {/* Sidebar - Only visible on mobile */}
      <aside 
        className="fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden -translate-x-full bg-background border-r border-gray-200 dark:border-gray-800 overflow-y-auto h-screen"
        id="sidebar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
        }}
      >
        <Sidebar className="h-full" />
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col w-full min-h-screen bg-background">
        {/* Mobile header - Client component for interactivity */}
        <MobileHeaderClient />
        
        {/* Page content */}
        <main className="flex-1 pt-16 lg:pt-0 overflow-y-auto pb-20 lg:pb-24">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation - Only visible on desktop */}
        <BottomNavbar />
      </div>
    </div>
  );
}
