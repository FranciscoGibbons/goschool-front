/**
 * Status Card Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * Uses semantic color tokens from the design system.
 * ==========================================================================
 */

import React from "react";
import { Card, CardContent } from "@/components/sacred";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  icon: React.ReactNode;
  text: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

// Using design token colors instead of hardcoded Tailwind colors
const statusVariants = {
  default: "bg-surface border-border text-text-primary",
  success: "bg-success-muted border-success/20 text-success",
  warning: "bg-warning-muted border-warning/20 text-warning",
  error: "bg-error-muted border-error/20 text-error",
  info: "bg-primary/10 border-primary/20 text-primary",
} as const;

export function StatusCard({
  icon,
  text,
  variant = "default",
  className,
}: StatusCardProps) {
  return (
    <Card className={cn(statusVariants[variant], className)}>
      <CardContent className="flex items-center gap-3">
        <div className="flex-shrink-0 [&>svg]:size-5">
          {icon}
        </div>
        <span className="text-sm font-medium leading-normal">
          {text}
        </span>
      </CardContent>
    </Card>
  );
}
