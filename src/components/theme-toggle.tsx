"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-sidebar-foreground" />
        <Switch disabled />
        <Moon className="h-4 w-4 text-sidebar-foreground" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-sidebar-foreground" />
      <Switch
        id="theme-mode"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-blue-900"
      />
      <Moon className="h-4 w-4 text-sidebar-foreground" />
    </div>
  );
}
