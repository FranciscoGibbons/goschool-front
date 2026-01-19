/**
 * Sacred Card Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * USAGE:
 * - ALL panels must use this component
 * - ALL summaries must use this component
 * - ALL info blocks must use this component
 *
 * VARIANTS:
 * - default: Static card with border
 * - interactive: Clickable card with hover state
 *
 * RULES:
 * - No shadows (border only)
 * - No gradients
 * - No custom border-radius
 * ==========================================================================
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Interactive cards have hover states and are clickable
   */
  interactive?: boolean;
  /**
   * Compact padding for dense layouts
   */
  compact?: boolean;
}

/**
 * Sacred Card
 *
 * @example
 * // Basic card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Título</CardTitle>
 *     <CardDescription>Descripción</CardDescription>
 *   </CardHeader>
 *   <CardContent>Contenido</CardContent>
 * </Card>
 *
 * @example
 * // Interactive card
 * <Card interactive onClick={handleClick}>
 *   <CardContent>Haz clic aquí</CardContent>
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, compact, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-surface border border-border rounded-lg",
        compact ? "p-4" : "p-5",
        interactive && [
          "cursor-pointer",
          "transition-colors duration-150",
          "hover:border-primary/40 hover:bg-surface-muted",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        ],

        className
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 mb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-text-primary leading-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-secondary", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-border-muted", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
