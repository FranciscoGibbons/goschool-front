import Sidebar from "../components/sidebar/Sidebar";
import { MobileHeaderClient } from "./components/mobile-header-client";
import BottomNavbar from "@/components/BottomNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-200 opacity-0 pointer-events-none"
        id="sidebar-overlay"
      />

      {/* Sidebar - Mobile (slide-in) */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out lg:hidden -translate-x-full bg-white dark:bg-[#020817]"
        id="sidebar"
      >
        <Sidebar className="h-full" />
      </aside>

      {/* Main content */}
      <div className="flex-1 w-full">
        {/* Mobile header */}
        <MobileHeaderClient />

        {/* Page content */}
        <main className="pt-14 lg:pt-0 pb-20 lg:pb-6 min-h-screen">
          <div className="page-container">{children}</div>
        </main>

        {/* Bottom Navigation - Desktop only */}
        <BottomNavbar />
      </div>
    </div>
  );
}
