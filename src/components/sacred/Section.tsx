/**
 * Sacred Layout Components
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * COMPONENTS:
 * - Container: Page-level max-width container
 * - Section: Vertical section with consistent spacing
 * - PageHeader: Page title and description area
 *
 * RULES:
 * - Use Container for all page content
 * - Use Section for logical groupings
 * - Consistent spacing across the app
 * ==========================================================================
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// ==========================================================================
// Container - Max-width wrapper for page content
// ==========================================================================

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container width variant
   * - narrow: 768px max-width (forms, content pages)
   * - default: 1280px max-width (dashboards, lists)
   * - wide: 1536px max-width (full-width layouts)
   */
  size?: "narrow" | "default" | "wide";
}

/**
 * Sacred Container
 *
 * @example
 * <Container>
 *   <PageHeader title="Alumnos" subtitle="Gestión de estudiantes" />
 *   <Section>Content here</Section>
 * </Container>
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "w-full mx-auto px-4 md:px-6 lg:px-8",
        {
          "max-w-3xl": size === "narrow",
          "max-w-7xl": size === "default",
          "max-w-[96rem]": size === "wide",
        },
        className
      )}
      {...props}
    />
  )
);
Container.displayName = "Container";

// ==========================================================================
// Section - Vertical grouping with spacing
// ==========================================================================

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Spacing size
   */
  spacing?: "sm" | "default" | "lg";
}

/**
 * Sacred Section
 *
 * @example
 * <Section>
 *   <SectionHeader title="Estadísticas" />
 *   <div>Section content</div>
 * </Section>
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "default", ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        {
          "py-4": spacing === "sm",
          "py-6": spacing === "default",
          "py-8": spacing === "lg",
        },
        className
      )}
      {...props}
    />
  )
);
Section.displayName = "Section";

// ==========================================================================
// Section Header
// ==========================================================================

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Section title
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Optional action slot (button, link, etc.)
   */
  action?: React.ReactNode;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 mb-4", className)}
      {...props}
    >
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

// ==========================================================================
// Page Header - Title area for pages
// ==========================================================================

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Page title
   */
  title: string;
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
  /**
   * Optional action slot (primary CTA)
   */
  action?: React.ReactNode;
  /**
   * Optional breadcrumb slot
   */
  breadcrumb?: React.ReactNode;
}

/**
 * Sacred Page Header
 *
 * @example
 * <PageHeader
 *   title="Alumnos"
 *   subtitle="Gestión de estudiantes del centro"
 *   action={<Button>Nuevo alumno</Button>}
 * />
 */
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, action, breadcrumb, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-6 md:mb-8", className)}
      {...props}
    >
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
);
PageHeader.displayName = "PageHeader";

// ==========================================================================
// Divider
// ==========================================================================

const Divider = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("border-0 border-t border-border-muted my-6", className)}
    {...props}
  />
));
Divider.displayName = "Divider";

// ==========================================================================
// Exports
// ==========================================================================

export { Container, Section, SectionHeader, PageHeader, Divider };
