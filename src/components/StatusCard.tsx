import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  icon: React.ReactNode;
  text: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const statusVariants = {
  default: "bg-card border-border text-card-foreground",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
  danger: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
} as const;

export function StatusCard({
  icon,
  text,
  variant = "default",
  className,
}: StatusCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      statusVariants[variant],
      className
    )}>
      <CardContent className="flex items-center p-4 gap-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span className="text-sm font-medium leading-normal">
          {text}
        </span>
      </CardContent>
    </Card>
  );
}
