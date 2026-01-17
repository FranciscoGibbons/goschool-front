# Migration Guide - Sacred Components

This guide explains how to migrate existing UI code to use the Sacred Components system defined in `DESIGN_CONTRACT.md`.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Import Changes](#import-changes)
3. [Component Migrations](#component-migrations)
4. [Color Token Migrations](#color-token-migrations)
5. [Common Patterns](#common-patterns)
6. [Checklist](#checklist)

---

## Quick Start

### 1. Update Imports

```tsx
// BEFORE - Old imports
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// AFTER - Sacred imports
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Badge,
} from "@/components/sacred";
```

### 2. Use Correct Variants

Sacred components have specific, limited variants per the design contract.

---

## Import Changes

| Old Import Path | New Import Path |
|-----------------|-----------------|
| `@/components/ui/button` | `@/components/sacred` |
| `@/components/ui/card` | `@/components/sacred` |
| `@/components/ui/badge` | `@/components/sacred` |
| `@/components/ui/table` | `@/components/sacred` |
| `@/components/ui/input` | `@/components/sacred` |
| `@/components/ui/select` | `@/components/sacred` |
| `@/components/ui/dialog` | `@/components/sacred` (use Modal) |

---

## Component Migrations

### Buttons

```tsx
// BEFORE
<Button variant="default">Click</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">More</Button>
<button className="bg-blue-500 text-white px-4 py-2 rounded">Custom</button>

// AFTER
<Button variant="primary">Click</Button>
<Button variant="danger">Delete</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">More</Button>
<Button variant="primary">Custom</Button>
```

**Variant Mapping:**
| Old Variant | New Variant |
|-------------|-------------|
| `default` | `primary` |
| `destructive` | `danger` |
| `outline` | `secondary` |
| `secondary` | `secondary` |
| `ghost` | `ghost` |
| `link` | Use text link instead |

### Cards

```tsx
// BEFORE
<div className="bg-white rounded-xl shadow-lg p-6">
  <h3 className="font-bold text-lg">Title</h3>
  <p>Content</p>
</div>

// AFTER
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

**Interactive Cards:**
```tsx
// BEFORE
<div className="cursor-pointer hover:shadow-lg transition" onClick={fn}>

// AFTER
<Card interactive onClick={fn}>
```

### Badges

```tsx
// BEFORE
<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
  Aprobado
</span>
<Badge variant="success">Aprobado</Badge>

// AFTER
<Badge variant="success">Aprobado</Badge>
```

**Variant Mapping:**
| Status | Variant |
|--------|---------|
| Approved, Passed, Complete | `success` |
| Pending, Attention | `warning` |
| Failed, Rejected, Error | `error` |
| Default, Inactive | `neutral` |
| Informational | `info` |

### Tables

```tsx
// BEFORE
<table className="w-full border-collapse">
  <thead>
    <tr>
      <th className="text-left p-4 bg-gray-100">Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="p-4 border-b">John</td>
    </tr>
  </tbody>
</table>

// AFTER
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Sortable Tables:**
```tsx
<TableHead
  sortable
  sortDirection={sortDir}
  onSort={() => handleSort('name')}
>
  Nombre
</TableHead>
```

### Forms

```tsx
// BEFORE
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Email</label>
  <input
    type="email"
    className="w-full border rounded px-3 py-2"
  />
  <p className="text-red-500 text-sm mt-1">Email is required</p>
</div>

// AFTER
<FormGroup>
  <Label htmlFor="email" required>Email</Label>
  <Input id="email" type="email" error />
  <ErrorMessage>Email is required</ErrorMessage>
</FormGroup>
```

### Modals

```tsx
// BEFORE
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// AFTER
<ConfirmationModal
  open={open}
  onOpenChange={setOpen}
  title="Confirm Delete"
  description="Are you sure?"
  onConfirm={handleDelete}
  danger
/>
```

### Empty States

```tsx
// BEFORE
<div className="text-center py-12">
  <svg>...</svg>
  <h3>No students found</h3>
  <p>Add your first student to get started</p>
  <button>Add Student</button>
</div>

// AFTER
<EmptyState
  icon="users"
  title="No students found"
  description="Add your first student to get started"
  action={{
    label: "Add Student",
    onClick: handleAdd
  }}
/>
```

### Page Layout

```tsx
// BEFORE
<div className="max-w-7xl mx-auto px-4 py-8">
  <div className="mb-8">
    <h1 className="text-2xl font-bold">Page Title</h1>
    <p className="text-gray-500">Description</p>
  </div>
  <div className="py-6">
    {/* content */}
  </div>
</div>

// AFTER
<Container>
  <PageHeader
    title="Page Title"
    subtitle="Description"
    action={<Button>Action</Button>}
  />
  <Section>
    {/* content */}
  </Section>
</Container>
```

---

## Color Token Migrations

### Text Colors

| Old Class | New Class |
|-----------|-----------|
| `text-gray-900` | `text-text-primary` |
| `text-gray-700` | `text-text-secondary` |
| `text-gray-500` | `text-text-muted` |
| `text-white` | `text-text-inverse` |

### Background Colors

| Old Class | New Class |
|-----------|-----------|
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-surface-muted` |
| `bg-gray-100` | `bg-surface-muted` |
| `bg-blue-500` | `bg-primary` |
| `bg-red-500` | `bg-error` |
| `bg-green-500` | `bg-success` |
| `bg-yellow-500` | `bg-warning` |

### Border Colors

| Old Class | New Class |
|-----------|-----------|
| `border-gray-200` | `border-border` |
| `border-gray-100` | `border-border-muted` |

### Status Colors

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-green-100 text-green-800` | `bg-success-muted text-success` |
| `bg-red-100 text-red-800` | `bg-error-muted text-error` |
| `bg-yellow-100 text-yellow-800` | `bg-warning-muted text-warning` |
| `bg-blue-100 text-blue-800` | `bg-primary/10 text-primary` |

---

## Common Patterns

### Remove Gradients

```tsx
// BEFORE
<div className="bg-gradient-to-r from-blue-500 to-purple-500">

// AFTER
<div className="bg-primary">
```

### Remove Heavy Shadows

```tsx
// BEFORE
<div className="shadow-lg shadow-xl shadow-2xl">

// AFTER
<div className="border border-border">
// or for floating elements:
<div className="shadow-sm">
```

### Remove Decorative Animations

```tsx
// BEFORE
<div className="animate-bounce animate-pulse animate-spin">

// AFTER
// Remove unless it's a loading indicator
<div>
```

### Remove Emoji Icons

```tsx
// BEFORE
<span>✅ Approved</span>
<span>❌ Rejected</span>

// AFTER
import { Check, X } from "lucide-react";
<Badge variant="success"><Check className="size-3" /> Approved</Badge>
<Badge variant="error"><X className="size-3" /> Rejected</Badge>
```

---

## Checklist

Use this checklist when migrating a page:

### Imports
- [ ] Updated all imports to `@/components/sacred`
- [ ] Removed unused UI component imports

### Colors
- [ ] No hardcoded hex/rgb values
- [ ] No Tailwind color classes (blue-500, gray-200, etc.)
- [ ] Using semantic tokens (text-primary, bg-surface, etc.)

### Components
- [ ] All buttons use Button component with correct variant
- [ ] All cards use Card component
- [ ] All tables use Table component
- [ ] All forms use Input/Select/Textarea components
- [ ] All status indicators use Badge component
- [ ] All modals use Modal/ConfirmationModal
- [ ] All empty states use EmptyState component

### Layout
- [ ] Page wrapped in Container
- [ ] Using PageHeader for title area
- [ ] Using Section for content groups

### Styling
- [ ] No gradients
- [ ] No heavy shadows (only shadow-sm if needed)
- [ ] No decorative animations
- [ ] No rounded-full on containers (max is rounded-lg)
- [ ] No inline styles

### Accessibility
- [ ] All inputs have labels
- [ ] All icon-only buttons have aria-label
- [ ] Focus states are visible
- [ ] Color contrast meets AA standard

---

## Need Help?

If you encounter a pattern not covered here, consult:
1. `DESIGN_CONTRACT.md` for design rules
2. Sacred component source files in `/src/components/sacred/`
3. Example usage in component JSDoc comments
