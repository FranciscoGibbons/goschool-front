# DESIGN CONTRACT - Sistema de Gestión Académica

> **This contract is LAW. No exceptions. No creativity. Only consistency.**

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Borders & Elevation](#5-borders--elevation)
6. [Accessibility](#6-accessibility)
7. [Sacred Components](#7-sacred-components)
8. [Forbidden Patterns](#8-forbidden-patterns)

---

## 1. DESIGN PRINCIPLES

### Hard Rules

| Rule | Description |
|------|-------------|
| **Institutional** | The interface must feel like a serious academic institution, not a startup |
| **Neutral** | No personality, no brand voice in the UI - only clarity |
| **Calm** | The interface should reduce cognitive load, not add to it |
| **Invisible** | The best UI is one users don't notice while working |

### Absolute Prohibitions

- ❌ **NO gradients** - Ever. Flat colors only.
- ❌ **NO decorative animations** - Only functional transitions (loading, state changes)
- ❌ **NO emojis as icons** - Use Lucide icons exclusively
- ❌ **NO multiple primary colors** - One primary color, used sparingly
- ❌ **NO custom components** - Only sacred components allowed
- ❌ **NO inline styles** - All styling through design tokens
- ❌ **NO hardcoded colors** - All colors from token system
- ❌ **NO rounded-full on containers** - Maximum border-radius is `--radius-lg`
- ❌ **NO shadows heavier than `shadow-sm`** - Flat design with borders

### Guiding Principles

1. **Consistency over originality** - Every element should look like it belongs
2. **Clarity over aesthetics** - Information hierarchy is paramount
3. **Durability over trends** - This UI must work for years without feeling dated
4. **Accessibility over convenience** - If it's not accessible, it's not shipped

---

## 2. COLOR SYSTEM

### Design Tokens (Semantic Names Only)

```
Token Name          | Usage                                    | Light Mode    | Dark Mode
--------------------|------------------------------------------|---------------|---------------
--background        | Page background                          | #FFFFFF       | #0F172A
--surface           | Cards, panels, tables                    | #FFFFFF       | #1E293B
--surface-muted     | Secondary panels, disabled areas         | #F8FAFC       | #334155
--border            | All borders, dividers                    | #E2E8F0       | #475569
--border-muted      | Subtle borders, table lines              | #F1F5F9       | #334155

--primary           | CTAs, active states, links               | #1E40AF       | #3B82F6
--primary-hover     | Primary on hover                         | #1E3A8A       | #2563EB
--primary-foreground| Text on primary backgrounds              | #FFFFFF       | #FFFFFF

--success           | Approved, passed, complete               | #15803D       | #22C55E
--success-muted     | Success backgrounds                      | #F0FDF4       | #14532D
--warning           | Pending, attention needed                | #A16207       | #FACC15
--warning-muted     | Warning backgrounds                      | #FEFCE8       | #422006
--error             | Failed, rejected, danger                 | #DC2626       | #EF4444
--error-muted       | Error backgrounds                        | #FEF2F2       | #450A0A

--text-primary      | Main content, headings                   | #0F172A       | #F8FAFC
--text-secondary    | Supporting text, labels                  | #475569       | #94A3B8
--text-muted        | Placeholders, disabled text              | #94A3B8       | #64748B
--text-inverse      | Text on dark backgrounds                 | #FFFFFF       | #0F172A
```

### Usage Rules

1. **Primary color is ONLY for:**
   - Primary action buttons
   - Active navigation items
   - Links
   - Selected states
   - Progress indicators

2. **Status colors are ONLY for:**
   - Badge backgrounds
   - Alert messages
   - Form validation states
   - Icon accents for status

3. **FORBIDDEN:**
   - Using raw hex/rgb values
   - Creating new color tokens
   - Using primary color for decorative purposes
   - Mixing status colors (no orange, no purple)

---

## 3. TYPOGRAPHY

### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;
```

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-xs` | 0.75rem (12px) | 1rem | 400-500 | Labels, captions, badges |
| `--text-sm` | 0.875rem (14px) | 1.25rem | 400-500 | Table cells, secondary text |
| `--text-base` | 1rem (16px) | 1.5rem | 400-500 | Body text, form inputs |
| `--text-lg` | 1.125rem (18px) | 1.75rem | 500-600 | Card titles, section headers |
| `--text-xl` | 1.25rem (20px) | 1.75rem | 600 | Page section titles |
| `--text-2xl` | 1.5rem (24px) | 2rem | 600 | Page titles |
| `--text-3xl` | 1.875rem (30px) | 2.25rem | 600 | Dashboard headers |

### Font Weight Rules

| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text, table cells |
| 500 | `font-medium` | Labels, navigation items, emphasis |
| 600 | `font-semibold` | Headings, buttons, important text |

**FORBIDDEN:**
- `font-thin` (100)
- `font-extralight` (200)
- `font-light` (300)
- `font-bold` (700)
- `font-extrabold` (800)
- `font-black` (900)

### Line Height for Readability

- **Tables:** `leading-relaxed` (1.625) for row content
- **Forms:** `leading-normal` (1.5) for labels
- **Long text:** `leading-relaxed` (1.625) for paragraphs
- **Headings:** `leading-tight` (1.25) or `leading-snug` (1.375)

---

## 4. SPACING SYSTEM

### Base Unit: 4px

All spacing must be multiples of 4px. Use the following scale:

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0 | Reset |
| `space-1` | 0.25rem (4px) | Tight inline spacing |
| `space-2` | 0.5rem (8px) | Icon gaps, badge padding |
| `space-3` | 0.75rem (12px) | Small component padding |
| `space-4` | 1rem (16px) | Default component padding |
| `space-5` | 1.25rem (20px) | Card padding |
| `space-6` | 1.5rem (24px) | Section gaps |
| `space-8` | 2rem (32px) | Major section gaps |
| `space-10` | 2.5rem (40px) | Page section spacing |
| `space-12` | 3rem (48px) | Large layout gaps |
| `space-16` | 4rem (64px) | Page margins |

### Component Spacing Standards

| Component | Padding | Gap |
|-----------|---------|-----|
| **Card** | `p-5` (20px) | - |
| **Table cell** | `px-4 py-3` | - |
| **Table header** | `px-4 py-3` | - |
| **Button** | `px-4 py-2` | `gap-2` (icons) |
| **Input** | `px-3 py-2` | - |
| **Badge** | `px-2 py-0.5` | - |
| **Modal** | `p-6` | `gap-4` |
| **Section** | `py-6` | `gap-6` |
| **Form group** | - | `gap-4` |
| **Button group** | - | `gap-3` |

### Page Layout

```
| Sidebar: 256px (w-64) | Main Content: flex-1 |

Main Content:
- Max width: 1280px (max-w-7xl)
- Padding: px-6 (desktop), px-4 (mobile)
- Top padding: pt-6
```

---

## 5. BORDERS & ELEVATION

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Tables, full-width elements |
| `--radius-sm` | 0.25rem (4px) | Badges, small buttons |
| `--radius-md` | 0.375rem (6px) | Inputs, buttons, chips |
| `--radius-lg` | 0.5rem (8px) | Cards, modals, dropdowns |

**MAXIMUM radius: `--radius-lg`**

### Border Rules

```css
/* Standard border */
border: 1px solid var(--border);

/* Muted border (tables, dividers) */
border: 1px solid var(--border-muted);

/* Focus border */
border: 2px solid var(--primary);

/* Error border */
border: 1px solid var(--error);
```

### Elevation (Shadows)

**ONLY ONE SHADOW ALLOWED:**

```css
/* Standard elevation - use sparingly */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
```

**Usage:**
- Dropdowns (on open)
- Modals
- Floating elements
- Popovers

**FORBIDDEN:**
- Shadows on cards
- Shadows on buttons
- Multiple shadow levels
- Colored shadows

### Prefer Borders Over Shadows

```css
/* ✓ CORRECT - Border for card separation */
.card {
  border: 1px solid var(--border);
}

/* ✗ WRONG - Shadow for card separation */
.card {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

## 6. ACCESSIBILITY

### Contrast Requirements

| Element | Minimum Ratio | Standard |
|---------|---------------|----------|
| Body text | 4.5:1 | WCAG AA |
| Large text (18px+) | 3:1 | WCAG AA |
| UI components | 3:1 | WCAG AA |
| Focus indicators | 3:1 | WCAG AA |

All tokens in this contract meet or exceed these ratios.

### Focus States

**MANDATORY for all interactive elements:**

```css
/* Focus visible state */
.interactive:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Focus within for form groups */
.form-group:focus-within {
  border-color: var(--primary);
}
```

### Keyboard Navigation

- All interactive elements must be reachable via Tab
- Focus order must follow visual order
- Focus must be visible at all times
- Skip links must be provided for main content

### Motion

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support

- All images must have alt text
- Icon-only buttons must have `aria-label`
- Form inputs must have associated labels
- Tables must have proper headers
- Dynamic content must use ARIA live regions

---

## 7. SACRED COMPONENTS

These are the ONLY components allowed in the application.

### Component Inventory

| Component | Variants | Required Props |
|-----------|----------|----------------|
| `Button` | primary, secondary, ghost, danger | children |
| `Card` | default, interactive | children |
| `Table` | sortable, fixed | columns, data |
| `Input` | text, email, password, number | label |
| `Select` | default | label, options |
| `Textarea` | default | label |
| `Badge` | success, warning, error, neutral | children |
| `Section` | default | children |
| `Container` | default, narrow, wide | children |
| `Header` | default | - |
| `Sidebar` | default | - |
| `Modal` | confirmation, alert | title, onClose |
| `EmptyState` | default | title |

### Component Rules

1. **No ad-hoc styling** - Components accept only predefined variants
2. **No wrapper divs** - Components handle their own layout
3. **No className prop** - Styling is controlled internally
4. **No inline styles** - Ever

### Import Pattern

```tsx
// ✓ CORRECT
import { Button, Card, Badge } from "@/components/sacred";

// ✗ WRONG
import { Button } from "@/components/ui/button";
<button className="bg-blue-500 text-white px-4 py-2">Click</button>
```

---

## 8. FORBIDDEN PATTERNS

### Code Patterns

```tsx
// ❌ NEVER - Inline styles
<div style={{ backgroundColor: "#f00" }}>

// ❌ NEVER - Hardcoded colors
<div className="bg-blue-500 text-gray-700">

// ❌ NEVER - Custom components
const MySpecialCard = () => <div className="rounded-xl shadow-lg">

// ❌ NEVER - Emoji icons
<span>✅ Approved</span>

// ❌ NEVER - Gradients
<div className="bg-gradient-to-r from-blue-500 to-purple-500">

// ❌ NEVER - Decorative animations
<div className="animate-bounce animate-pulse">

// ❌ NEVER - Non-token spacing
<div className="p-[13px] mt-[7px]">

// ❌ NEVER - Non-token borders
<div className="rounded-[20px] border-[3px]">
```

### Visual Patterns

| Pattern | Status |
|---------|--------|
| Gradient backgrounds | ❌ FORBIDDEN |
| Glowing effects | ❌ FORBIDDEN |
| Colored shadows | ❌ FORBIDDEN |
| Icon-only buttons without labels | ❌ FORBIDDEN |
| Multiple CTAs with same weight | ❌ FORBIDDEN |
| Decorative illustrations | ❌ FORBIDDEN |
| Progress bars without labels | ❌ FORBIDDEN |
| Hover-only information | ❌ FORBIDDEN |
| Auto-playing carousels | ❌ FORBIDDEN |
| Infinite scroll without option | ❌ FORBIDDEN |

---

## COMPLIANCE CHECKLIST

Before any PR is merged, verify:

- [ ] All colors use design tokens
- [ ] All spacing uses the spacing scale
- [ ] All components are sacred components
- [ ] No inline styles exist
- [ ] No gradients exist
- [ ] No decorative animations exist
- [ ] No emojis as icons
- [ ] Focus states are visible
- [ ] Contrast ratios meet AA standard
- [ ] Keyboard navigation works

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-17 | Initial contract established |

---

> **Remember:** The interface should disappear while working.
> Users should focus on their tasks, not on the UI.
> If they notice the interface, we have failed.
