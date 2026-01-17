/**
 * Tailwind CSS Configuration
 * ==========================================================================
 * DESIGN CONTRACT COMPLIANT
 * See DESIGN_CONTRACT.md for usage rules
 *
 * RULES:
 * - No colors outside the token system
 * - No border-radius outside the scale
 * - No shadows heavier than shadow-sm
 * - No decorative animations
 * ==========================================================================
 */

const config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // =======================================================================
      // TYPOGRAPHY - Per DESIGN_CONTRACT.md
      // =======================================================================
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },

      fontWeight: {
        // Only allowed weights per DESIGN_CONTRACT.md
        normal: "400",
        medium: "500",
        semibold: "600",
      },

      // =======================================================================
      // SPACING - 4px base unit per DESIGN_CONTRACT.md
      // =======================================================================
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // =======================================================================
      // COLORS - Semantic tokens per DESIGN_CONTRACT.md
      // =======================================================================
      colors: {
        // Core backgrounds
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        "surface-muted": "hsl(var(--surface-muted))",

        // Borders
        border: "hsl(var(--border))",
        "border-muted": "hsl(var(--border-muted))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Text hierarchy
        foreground: "hsl(var(--foreground))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        "text-inverse": "hsl(var(--text-inverse))",

        // Primary (use sparingly)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Status colors (functional only)
        success: {
          DEFAULT: "hsl(var(--success))",
          muted: "hsl(var(--success-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          muted: "hsl(var(--warning-muted))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          muted: "hsl(var(--error-muted))",
        },

        // Legacy shadcn/ui compatibility
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Sidebar
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Charts
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },

      // =======================================================================
      // BORDER RADIUS - Per DESIGN_CONTRACT.md (max: radius-lg)
      // =======================================================================
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        // Aliases for shadcn compatibility
        DEFAULT: "var(--radius)",
      },

      // =======================================================================
      // SHADOWS - Only shadow-sm allowed per DESIGN_CONTRACT.md
      // =======================================================================
      boxShadow: {
        // The ONLY shadow allowed in the design system
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        // Explicitly mark others as deprecated
        DEFAULT: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // Alias to sm
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)", // Alias to sm
      },

      // =======================================================================
      // ANIMATIONS - Functional only per DESIGN_CONTRACT.md
      // =======================================================================
      transitionDuration: {
        "150": "150ms", // Standard transitions
        "200": "200ms", // Slightly slower
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.2s ease-out",
      },

      // =======================================================================
      // CONTAINER - Consistent max-width
      // =======================================================================
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "2xl": "1280px", // Max-width per DESIGN_CONTRACT.md
        },
      },
    },
  },
  plugins: [],
};

export default config;
