import Sidebar from "../components/sidebar/Sidebar";
import { MobileHeaderClient } from "./components/mobile-header-client";
import MobileBottomTabs from "@/components/MobileBottomTabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-background flex">
      {/* Sidebar - Desktop only */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30 bg-sidebar">
        <Sidebar className="h-full" />
      </aside>

      {/* Main content */}
      <div className="flex-1 w-full lg:ml-64">
        {/* Mobile header */}
        <MobileHeaderClient />

        {/* Page content */}
        <main className="pt-14 lg:pt-0 pb-20 lg:pb-6 min-h-screen">
          <div className="page-container">{children}</div>
        </main>

        {/* Bottom Navigation - Mobile only */}
        <MobileBottomTabs />
      </div>
    </div>
  );
}
