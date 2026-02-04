/**
 * Derives a full color palette from a single hex color.
 *
 * The default theme uses hue ~158 (green). This utility takes any hex color,
 * extracts its hue, and generates all the CSS variables needed to re-skin
 * the app while preserving the same saturation/lightness relationships.
 *
 * Returns two sets of variables:
 * - `--color-*` variables used by Tailwind 4 @theme
 * - `--*` variables used by CSS rules with `hsl(var(--*))` syntax
 */

function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, Math.round(l * 100)];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hsl(h: number, s: number, l: number): string {
  // Wrap hue to 0-360
  h = ((h % 360) + 360) % 360;
  return `hsl(${h} ${s}% ${l}%)`;
}

function hslRaw(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  return `${h} ${s}% ${l}%`;
}

export function derivePalette(hex: string): Record<string, string> {
  const [h] = hexToHsl(hex);

  // The original theme uses hue 158 for primary and offsets of -3 to -10
  // for neutral elements. We replicate that pattern with the new hue.

  const vars: Record<string, string> = {};

  // Helper: set both --color-X and --X
  function set(name: string, hue: number, sat: number, lig: number) {
    vars[`--color-${name}`] = hsl(hue, sat, lig);
    vars[`--${name}`] = hslRaw(hue, sat, lig);
  }

  // ── Core backgrounds ──
  set("background", h - 10, 22, 94);
  set("surface", h - 8, 14, 98.5);
  set("surface-muted", h - 8, 20, 92);

  // ── Borders ──
  set("border", h - 8, 18, 82);
  set("border-muted", h - 8, 18, 88);
  set("input", h - 8, 18, 82);
  set("ring", h, 45, 32);

  // ── Text hierarchy ──
  set("foreground", h - 3, 28, 14);
  set("text-primary", h - 3, 28, 14);
  set("text-secondary", h - 6, 12, 40);
  set("text-muted", h - 8, 8, 54);
  // text-inverse stays white

  // ── Primary ──
  set("primary", h, 45, 32);
  set("primary-hover", h, 45, 26);
  // primary-foreground stays white

  // ── Legacy shadcn ──
  set("secondary", h - 8, 18, 89);
  set("secondary-foreground", h - 3, 28, 14);
  set("muted", h - 8, 18, 89);
  set("muted-foreground", h - 6, 12, 40);
  set("accent", h - 8, 22, 91);
  set("accent-foreground", h - 3, 28, 14);
  set("popover", h - 8, 14, 98.5);
  set("popover-foreground", h - 3, 28, 14);
  set("card", h - 8, 14, 98.5);
  set("card-foreground", h - 3, 28, 14);

  // ── Sidebar ──
  set("sidebar", h - 3, 35, 15);
  set("sidebar-foreground", h - 8, 15, 78);
  set("sidebar-primary", h, 55, 50);
  set("sidebar-primary-foreground", 0, 0, 100);
  set("sidebar-accent", h - 3, 30, 22);
  set("sidebar-accent-foreground", 0, 0, 96);
  set("sidebar-border", h - 3, 25, 20);
  set("sidebar-ring", h, 55, 50);

  // ── Charts (1 uses primary, rest derived) ──
  set("chart-1", h, 45, 32);
  set("chart-2", h - 6, 50, 40);
  // chart-3 (warning yellow), chart-4, chart-5 stay
  set("chart-4", h - 18, 35, 45);
  set("chart-5", h + 17, 30, 42);

  // ── Gradients ──
  set("gradient-start", h, 45, 40);
  set("gradient-mid", h + 17, 50, 45);
  set("gradient-end", h - 6, 50, 40);

  return vars;
}

/**
 * Default hue (green) used by the static CSS theme.
 * If a school's color resolves to this hue, we skip overriding.
 */
export const DEFAULT_HUE = 158;

export function shouldApplyTheme(hex: string | null | undefined): boolean {
  if (!hex) return false;
  const [h] = hexToHsl(hex);
  // Skip if the hue is within +-5 of the default green
  return Math.abs(h - DEFAULT_HUE) > 5;
}
