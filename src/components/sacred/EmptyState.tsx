/**
 * Sacred Empty State Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * USAGE:
 * - Display when there is no data
 * - Provide helpful message and optional action
 *
 * RULES:
 * - Use Lucide icons only
 * - No decorative illustrations
 * - Clear, actionable message
 * ==========================================================================
 */

import * as React from "react";
import { Inbox, Search, FileText, Users, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

// ==========================================================================
// Pre-defined icons for common empty states
// ==========================================================================

const emptyStateIcons = {
  default: Inbox,
  search: Search,
  document: FileText,
  users: Users,
  calendar: Calendar,
  error: AlertCircle,
} as const;

export type EmptyStateIconType = keyof typeof emptyStateIcons;

// ==========================================================================
// Empty State Component
// ==========================================================================

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Title text
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Pre-defined icon type or custom icon element
   */
  icon?: EmptyStateIconType | React.ReactNode;
  /**
   * Primary action
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Secondary action
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Size variant
   */
  size?: "sm" | "default" | "lg";
}

/**
 * Sacred Empty State
 *
 * @example
 * // Basic empty state
 * <EmptyState
 *   icon="users"
 *   title="No hay alumnos"
 *   description="Aún no hay alumnos registrados en este curso."
 *   action={{
 *     label: "Agregar alumno",
 *     onClick: handleAdd
 *   }}
 * />
 *
 * @example
 * // Search empty state
 * <EmptyState
 *   icon="search"
 *   title="Sin resultados"
 *   description="No se encontraron resultados para tu búsqueda."
 * />
 *
 * @example
 * // Custom icon
 * <EmptyState
 *   icon={<CustomIcon />}
 *   title="Estado personalizado"
 * />
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      icon = "default",
      action,
      secondaryAction,
      size = "default",
      ...props
    },
    ref
  ) => {
    // Resolve icon
    const IconComponent =
      typeof icon === "string" ? emptyStateIcons[icon] : null;

    const iconSizeClasses = {
      sm: "w-8 h-8",
      default: "w-12 h-12",
      lg: "w-16 h-16",
    };

    const paddingClasses = {
      sm: "py-6 px-4",
      default: "py-12 px-6",
      lg: "py-16 px-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          paddingClasses[size],
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className={cn("text-text-muted/50 mb-4", iconSizeClasses[size])}>
          {IconComponent ? (
            <IconComponent className="w-full h-full" aria-hidden="true" />
          ) : (
            icon
          )}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-medium text-text-primary",
            size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-text-muted max-w-sm mt-1",
              size === "sm" ? "text-xs" : "text-sm"
            )}
          >
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3 mt-4">
            {secondaryAction && (
              <Button
                variant="secondary"
                size={size === "lg" ? "default" : "sm"}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
            {action && (
              <Button
                variant="primary"
                size={size === "lg" ? "default" : "sm"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState };
