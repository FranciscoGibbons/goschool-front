"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileHeaderClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar && overlay) {
      const isOpen = !isSidebarOpen;
      setIsSidebarOpen(isOpen);

      sidebar.classList.toggle("translate-x-0", isOpen);
      overlay.style.opacity = isOpen ? "1" : "0";
      overlay.style.pointerEvents = isOpen ? "auto" : "none";
    }
  };

  return (
    <header className="lg:hidden h-14 bg-white dark:bg-[#020817] border-b border-border flex items-center px-4 fixed top-0 left-0 right-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-9 w-9"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <span className="ml-3 text-sm font-medium text-foreground">
        Stella Maris
      </span>
    </header>
  );
}
