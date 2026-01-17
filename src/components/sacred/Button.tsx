/**
 * Sacred Button Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * VARIANTS (only these are allowed):
 * - primary: Main CTAs and key actions
 * - secondary: Secondary actions
 * - ghost: Tertiary/subtle actions
 * - danger: Destructive actions
 *
 * SIZES:
 * - sm: Small buttons (32px height)
 * - default: Standard buttons (40px height)
 * - lg: Large buttons (48px height)
 * - icon: Icon-only buttons
 *
 * RULES:
 * - No custom className allowed
 * - No gradients, shadows, or decorative effects
 * - Must have accessible focus states
 * ==========================================================================
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles - consistent across all variants
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap font-medium",
    "border-0 outline-none",
    "transition-colors duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary-hover",
        ],
        secondary: [
          "bg-surface text-text-primary border border-border",
          "hover:bg-surface-muted hover:border-text-muted",
        ],
        ghost: [
          "bg-transparent text-text-primary",
          "hover:bg-surface-muted",
        ],
        danger: [
          "bg-error text-text-inverse",
          "hover:bg-error/90",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm",
        default: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-md",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as a child component (for use with Next.js Link, etc.)
   */
  asChild?: boolean;
  /**
   * Loading state - disables button and shows loading indicator
   */
  loading?: boolean;
}

/**
 * Sacred Button
 *
 * @example
 * // Primary action
 * <Button variant="primary">Guardar cambios</Button>
 *
 * @example
 * // Secondary action
 * <Button variant="secondary">Cancelar</Button>
 *
 * @example
 * // Danger action
 * <Button variant="danger">Eliminar</Button>
 *
 * @example
 * // Ghost action
 * <Button variant="ghost" size="icon">
 *   <PlusIcon />
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
