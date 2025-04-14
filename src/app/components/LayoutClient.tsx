"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // evita renderizar hasta estar seguro de estar en el cliente.
  }

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <main className="w-full h-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
