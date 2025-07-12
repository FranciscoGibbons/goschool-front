// src/app/(dashboard)/layout.tsx
import Sidebar from "../components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen">
      <Sidebar className="bg-background" />
      <main className="flex-1 h-full overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
