/**
 * Sacred Badge Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * VARIANTS (status indicators only):
 * - success: Approved, passed, complete (green)
 * - warning: Pending, attention needed (yellow/amber)
 * - error: Failed, rejected, danger (red)
 * - neutral: Default, inactive (gray)
 * - info: Informational (blue/primary)
 *
 * RULES:
 * - Use ONLY for status indicators
 * - No decorative use
 * - No custom colors
 * ==========================================================================
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Base styles
  [
    "inline-flex items-center gap-1",
    "px-2 py-0.5",
    "text-xs font-medium",
    "rounded-sm",
  ],
  {
    variants: {
      variant: {
        success: "bg-success-muted text-success",
        warning: "bg-warning-muted text-warning",
        error: "bg-error-muted text-error",
        neutral: "bg-surface-muted text-text-secondary",
        info: "bg-primary/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode;
}

/**
 * Sacred Badge
 *
 * @example
 * // Success status
 * <Badge variant="success">Aprobado</Badge>
 *
 * @example
 * // Warning status
 * <Badge variant="warning">Pendiente</Badge>
 *
 * @example
 * // Error status
 * <Badge variant="error">Reprobado</Badge>
 *
 * @example
 * // With icon
 * <Badge variant="success" icon={<CheckIcon />}>
 *   Completado
 * </Badge>
 */
function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && <span className="[&>svg]:size-3">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
