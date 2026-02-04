"use client";

import { useEffect, useRef } from "react";
import { derivePalette, shouldApplyTheme } from "@/lib/theme-colors";

/**
 * Fetches the school's primary_color from the backend and applies
 * a derived color palette as CSS custom properties on <html>.
 *
 * - Extracts the tenant slug from `window.location.hostname`
 * - Calls `/api/proxy/school-info/{slug}` to get school settings
 * - Derives ~40 CSS variables from the primary color
 * - Falls back gracefully to the default green theme on error
 *
 * This is non-blocking: the default CSS theme loads instantly,
 * then the school color is applied once fetched.
 */
export function SchoolThemeProvider({ children }: { children: React.ReactNode }) {
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;

    const host = window.location.hostname;
    const match = host.match(/^([a-z0-9-]+)\.goschool\./);

    // Resolve slug: subdomain or default school env var
    const slug = match?.[1] || process.env.NEXT_PUBLIC_DEFAULT_SCHOOL;
    if (!slug) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/proxy/school-info/${slug}`, {
          credentials: "include",
        });
        if (!res.ok || cancelled) return;

        const school = await res.json();
        if (cancelled) return;

        const color: string | null = school.primary_color;
        if (!shouldApplyTheme(color)) return;

        const palette = derivePalette(color!);
        const root = document.documentElement;

        for (const [prop, value] of Object.entries(palette)) {
          root.style.setProperty(prop, value);
        }

        // Update the meta theme-color for browser chrome
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute("content", color!);
        }

        applied.current = true;
      } catch {
        // Silently fall back to default theme
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
