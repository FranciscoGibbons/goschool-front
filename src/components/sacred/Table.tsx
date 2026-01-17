/**
 * Sacred Table Component
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * FEATURES:
 * - Sortable columns
 * - Consistent row height for readability
 * - Optimized for long reading sessions
 * - Accessible with proper ARIA attributes
 *
 * RULES:
 * - Use for ALL data tables
 * - No inline styles
 * - No custom styling
 * ==========================================================================
 */

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================================================
// Table Root
// ==========================================================================

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        "border-collapse border-spacing-0",
        "bg-surface border border-border rounded-lg overflow-hidden",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

// ==========================================================================
// Table Header
// ==========================================================================

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-surface-muted [&_tr]:border-b", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

// ==========================================================================
// Table Body
// ==========================================================================

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

// ==========================================================================
// Table Footer
// ==========================================================================

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-surface-muted font-medium", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// ==========================================================================
// Table Row
// ==========================================================================

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border-muted",
      "transition-colors duration-150",
      "hover:bg-surface-muted/50",
      "data-[state=selected]:bg-surface-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

// ==========================================================================
// Table Head Cell
// ==========================================================================

export type SortDirection = "asc" | "desc" | null;

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Enable sorting for this column
   */
  sortable?: boolean;
  /**
   * Current sort direction
   */
  sortDirection?: SortDirection;
  /**
   * Callback when sort is toggled
   */
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (sortable && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSort?.();
      }
    };

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle",
          "text-xs font-medium text-text-secondary uppercase tracking-wider",
          sortable && [
            "cursor-pointer select-none",
            "transition-colors duration-150",
            "hover:bg-surface-muted",
          ],
          sortDirection && "text-primary",
          className
        )}
        onClick={sortable ? onSort : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={sortable ? 0 : undefined}
        role={sortable ? "button" : undefined}
        aria-sort={
          sortDirection === "asc"
            ? "ascending"
            : sortDirection === "desc"
            ? "descending"
            : undefined
        }
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {children}
          {sortable && (
            <span className="[&>svg]:size-3.5">
              {sortDirection === "asc" ? (
                <ChevronUp aria-hidden="true" />
              ) : sortDirection === "desc" ? (
                <ChevronDown aria-hidden="true" />
              ) : (
                <ChevronsUpDown className="opacity-50" aria-hidden="true" />
              )}
            </span>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

// ==========================================================================
// Table Cell
// ==========================================================================

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-4 py-3 align-middle",
      "text-sm text-text-primary leading-relaxed",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// ==========================================================================
// Table Caption
// ==========================================================================

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-text-muted", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// ==========================================================================
// Exports
// ==========================================================================

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
