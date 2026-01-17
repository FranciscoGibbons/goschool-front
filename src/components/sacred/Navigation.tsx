/**
 * Sacred Navigation Components
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 *
 * COMPONENTS:
 * - Header: Top navigation bar
 * - Sidebar: Side navigation
 * - NavItem: Navigation item
 *
 * RULES:
 * - Institutional appearance
 * - Clear active states
 * - Accessible navigation
 * ==========================================================================
 */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ==========================================================================
// Header
// ==========================================================================

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Logo or brand element
   */
  logo?: React.ReactNode;
  /**
   * Right-side actions (user menu, settings, etc.)
   */
  actions?: React.ReactNode;
}

/**
 * Sacred Header
 *
 * @example
 * <Header
 *   logo={<Logo />}
 *   actions={<UserMenu />}
 * />
 */
const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, logo, actions, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-40",
        "flex items-center justify-between",
        "h-16 px-4 md:px-6",
        "bg-surface border-b border-border",
        className
      )}
      {...props}
    >
      {/* Logo / Brand */}
      {logo && <div className="flex-shrink-0">{logo}</div>}

      {/* Center content */}
      {children && <div className="flex-1 px-4">{children}</div>}

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
);
Header.displayName = "Header";

// ==========================================================================
// Sidebar
// ==========================================================================

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Header content (logo, etc.)
   */
  header?: React.ReactNode;
  /**
   * Footer content (user info, etc.)
   */
  footer?: React.ReactNode;
  /**
   * Whether sidebar is collapsed (mobile)
   */
  collapsed?: boolean;
}

/**
 * Sacred Sidebar
 *
 * @example
 * <Sidebar
 *   header={<Logo />}
 *   footer={<UserInfo />}
 * >
 *   <NavGroup title="Principal">
 *     <NavItem href="/dashboard" icon={<HomeIcon />}>Dashboard</NavItem>
 *   </NavGroup>
 * </Sidebar>
 */
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, header, footer, collapsed, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        "flex flex-col",
        "w-64 h-full",
        "bg-sidebar border-r border-sidebar-border",
        collapsed && "w-16",
        className
      )}
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 h-16 flex items-center px-4 border-b border-sidebar-border">
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">{children}</nav>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
          {footer}
        </div>
      )}
    </aside>
  )
);
Sidebar.displayName = "Sidebar";

// ==========================================================================
// Nav Group
// ==========================================================================

export interface NavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Group title
   */
  title?: string;
}

const NavGroup = React.forwardRef<HTMLDivElement, NavGroupProps>(
  ({ className, title, children, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4", className)} {...props}>
      {title && (
        <h3 className="px-3 mb-2 text-xs font-medium text-sidebar-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <ul className="space-y-1">{children}</ul>
    </div>
  )
);
NavGroup.displayName = "NavGroup";

// ==========================================================================
// Nav Item
// ==========================================================================

export interface NavItemProps {
  /**
   * Navigation href
   */
  href: string;
  /**
   * Icon element
   */
  icon?: React.ReactNode;
  /**
   * Item label
   */
  children: React.ReactNode;
  /**
   * External link
   */
  external?: boolean;
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Sacred NavItem
 *
 * @example
 * <NavItem href="/dashboard" icon={<HomeIcon />}>
 *   Dashboard
 * </NavItem>
 */
function NavItem({ href, icon, children, external, className }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3",
          "px-3 py-2",
          "text-sm font-medium",
          "rounded-md",
          "transition-colors duration-150",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          className
        )}
        {...linkProps}
      >
        {icon && <span className="[&>svg]:size-5 flex-shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
      </Link>
    </li>
  );
}

// ==========================================================================
// Breadcrumb
// ==========================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

/**
 * Sacred Breadcrumb
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Alumnos", href: "/alumnos" },
 *     { label: "Detalle" }
 *   ]}
 * />
 */
function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-text-muted" aria-hidden="true">
                /
              </span>
            )}
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-text-secondary hover:text-text-primary transition-colors duration-150"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  index === items.length - 1
                    ? "text-text-primary font-medium"
                    : "text-text-secondary"
                )}
                aria-current={index === items.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ==========================================================================
// Exports
// ==========================================================================

export { Header, Sidebar, NavGroup, NavItem, Breadcrumb };
