# Karma — Master Design System (DESIGN.md)

> **Design Authority for Stitch MCP & Frontend Engineering**
> 
> **Product:** Karma — Multi-Tenant School Management & Learning SaaS
> **Design Mode:** **Operate** (Task efficiency, data scanability, calm authority, high signal-to-noise ratio)
> **Target Audience:** School Administrators, Teachers, Students (Grades 1–12), and Parents
> **Languages & Layout:** English (`en`, LTR) & Arabic (`ar`, RTL) with native bidirectional support

---

## 1. Visual Philosophy & Art Direction

### 1.1 Aesthetic Identity: *Modern Academic Workspace*
- **Calm & Focused:** Clean slate surfaces, subtle 1px border definitions, and generous whitespace. We avoid chaotic multi-color dashboard cards or playful juvenile styles; the tool must feel like Linear or Stripe, tailored for education.
- **Data-Dense with Breathing Room:** High information density where needed (tables, gradebooks, timetables), balanced with structured visual grouping (card containment, clear typographic hierarchy).
- **Physical-Property Prohibition:** All spatial logic (margins, paddings, borders, flex/grid alignments, positioning) strictly uses **CSS logical properties** (`margin-inline-start`, `padding-inline`, `inset-inline-end`).
- **Semantic Color Hierarchy (60-30-10 Rule):**
  - **60% Dominant Base:** Slate background & white/charcoal card surfaces.
  - **30% Structure & Text:** Crisp high-contrast typography and subtle borders.
  - **10% Intentional Accent:** Electric Indigo/Royal Blue for brand actions, plus strict semantic badges (Emerald for Success, Amber for Late, Crimson for Absent/Overdue).

---

## 2. Design Tokens & Color Matrix

### 2.1 Core Palette & Theme Tokens

All text/background pairings strictly satisfy **WCAG 2.2 AA contrast (≥ 4.5:1 for normal text, ≥ 3.0:1 for large text & UI controls)**.

```css
:root {
  /* Surface & Base */
  --bg-app: #f8fafc;              /* Slate 50 */
  --bg-surface: #ffffff;          /* Pure White */
  --bg-surface-elevated: #ffffff; /* Modals / Dropdowns */
  --bg-surface-subtle: #f1f5f9;   /* Slate 100 - Table headers / Inactive pills */
  --bg-surface-hover: #f8fafc;    /* Slate 50 */

  /* Text & Content */
  --text-primary: #0f172a;        /* Slate 900 - Contrast 16.1:1 on white */
  --text-secondary: #475569;      /* Slate 600 - Contrast 7.0:1 on white */
  --text-muted: #64748b;          /* Slate 500 - Contrast 4.6:1 on white */
  --text-inverse: #ffffff;

  /* Borders & Dividers */
  --border-default: #e2e8f0;      /* Slate 200 */
  --border-subtle: #f1f5f9;       /* Slate 100 */
  --border-focus: #2563eb;        /* Blue 600 */

  /* Brand Primary */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;         /* Core Brand */
  --primary-700: #1d4ed8;
  --primary-foreground: #ffffff;

  /* Semantic Status Tokens */
  --status-success-bg: #ecfdf5;   /* Emerald 50 */
  --status-success-text: #065f46; /* Emerald 800 */
  --status-success-border: #a7f3d0;/* Emerald 200 */
  --status-success-solid: #10b981;/* Emerald 500 */

  --status-warning-bg: #fffbeb;   /* Amber 50 */
  --status-warning-text: #92400e; /* Amber 800 */
  --status-warning-border: #fde68a;/* Amber 200 */
  --status-warning-solid: #f59e0b;/* Amber 500 */

  --status-error-bg: #fef2f2;     /* Red 50 */
  --status-error-text: #991b1b;   /* Red 800 */
  --status-error-border: #fecaca;  /* Red 200 */
  --status-error-solid: #ef4444;  /* Red 500 */

  --status-info-bg: #eef2ff;      /* Indigo 50 */
  --status-info-text: #3730a3;    /* Indigo 800 */
  --status-info-border: #c7d2fe;  /* Indigo 200 */
  --status-info-solid: #6366f1;   /* Indigo 500 */
}

/* Dark Mode Tokens */
.dark {
  --bg-app: #090d16;              /* Deep Slate Navy */
  --bg-surface: #111827;          /* Gray 900 */
  --bg-surface-elevated: #1f2937; /* Gray 800 */
  --bg-surface-subtle: #1e293b;   /* Slate 800 */
  --bg-surface-hover: #1e293b;

  --text-primary: #f8fafc;        /* Slate 50 - Contrast 15.2:1 */
  --text-secondary: #94a3b8;      /* Slate 400 - Contrast 5.8:1 */
  --text-muted: #64748b;          /* Slate 500 */
  --text-inverse: #0f172a;

  --border-default: #1e293b;      /* Slate 800 */
  --border-subtle: #172033;
  --border-focus: #60a5fa;

  --primary-600: #3b82f6;         /* Brightened for dark contrast */
  --primary-foreground: #ffffff;

  --status-success-bg: #064e3b33;
  --status-success-text: #34d399;
  --status-warning-bg: #78350f33;
  --status-warning-text: #fbbf24;
  --status-error-bg: #7f1d1d33;
  --status-error-text: #f87171;
  --status-info-bg: #312e8133;
  --status-info-text: #818cf8;
}
```

---

## 3. Typography & RTL Pairing

### 3.1 Font Stack
- **Latin:** `Inter`, `Geist Sans`, or `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Arabic:** `IBM Plex Sans Arabic`, `Readex Pro`, or `"Noto Sans Arabic", "Segoe UI Arabic", Tahoma, sans-serif`

### 3.2 Type Scale

| Level | Size (Desktop / Mobile) | Line Height | Weight | Letter Spacing | Purpose |
|---|---|---|---|---|---|
| **Display** | 32px / 28px | 1.25 | 700 (Bold) | `-0.02em` | Major stats, welcome hero |
| **Heading 1** | 24px / 22px | 1.3 | 600 (Semibold) | `-0.015em` | Page Titles |
| **Heading 2** | 18px / 18px | 1.35 | 600 (Semibold) | `-0.01em` | Section Headers, Drawer Titles |
| **Heading 3** | 15px / 15px | 1.4 | 600 (Semibold) | `0` | Card Titles, Modal Headers |
| **Body Default** | 14px / 14px | 1.5 | 400 (Regular) | `0` | Table data, form fields, copy |
| **Body Medium** | 14px / 14px | 1.5 | 500 (Medium) | `0` | Navigation items, button text |
| **Small / Caption** | 12px / 12px | 1.4 | 500 (Medium) | `0.01em` | Status badges, timestamps, hints |
| **Micro** | 11px / 11px | 1.3 | 600 (Semibold) | `0.02em` | Uppercase table headers, tags |

---

## 4. Spacing, Radii, Shadows & Elevation

### 4.1 Spacing Scale (8-point System)
- `space-1`: 4px (tight padding, badge insets)
- `space-2`: 8px (icon-to-text gap, input vertical padding)
- `space-3`: 12px (button horizontal padding, small card gap)
- `space-4`: 16px (card inner padding, standard component gutter)
- `space-6`: 24px (section gaps, layout margins)
- `space-8`: 32px (page header margins, major layout grid gaps)
- `space-12`: 48px (empty state containers)

### 4.2 Border Radius
- `radius-sm`: 4px (inputs, badges, small control tags)
- `radius-md`: 8px (buttons, dropdowns, table row hover bounds)
- `radius-lg`: 12px (cards, dashboard widgets, modal containers)
- `radius-xl`: 16px (slide-over drawers, preview panels)
- `radius-full`: 9999px (avatars, status indicators, pill filters)

### 4.3 Shadows & Elevation
- **Level 0 (Flat):** `border: 1px solid var(--border-default)` (standard cards on `--bg-app`).
- **Level 1 (Hover/Card):** `box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)`
- **Level 2 (Popovers/Menus):** `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)`
- **Level 3 (Drawers & Modals):** `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)`

---

## 5. Master Component Specifications

### 5.1 App Shell & Navigation
- **Sidebar (Collapsible):** Width 256px (expanded) / 68px (collapsed). Contains Logo, Academic Year selector pill, Role-aware navigation groups with Lucide icons, and User Profile menu at bottom.
- **Top Bar:** Breadcrumbs on start, Global Search / Command Palette (`⌘K`), Language Switcher (`EN` / `العربية`), Theme Switcher, and Notification Bell with animated unread badge.
- **For Parents:** Prominent child switcher dropdown pill (`Selecting: Omar Hatem - Grade 10A`) in the top bar.

### 5.2 Slide-Over Drawer Pattern (Core UX Invariant)
- **Why:** All create and edit workflows (e.g. Create Student, Grade Assignment, Add Timetable Slot) open in a **Slide-Over Drawer (width 480px–640px)** anchored to the inline-end (`right` in LTR, `left` in RTL).
- **Behavior:** Background overlay dims at 40% opacity; form footer is sticky with `Cancel` (secondary) and `Save Changes` (primary); form contents scroll smoothly.

### 5.3 Data Tables (`@tanstack/react-table`)
- **Structure:** Sticky header with uppercase micro-typography, hoverable rows, checkbox multi-select column, inline status badges, and action dropdown menu (`...`).
- **Footer:** Server-side pagination controls (e.g., `Showing 1–20 of 120 students`, items per page selector, previous/next buttons).
- **Interactive States:** Shimmer skeleton rows on load; empty illustration with "Add First Item" CTA when zero records exist.

### 5.4 Form Controls & Validation
- **Input Fields:** 38px height, 1px border, subtle focus ring (`ring-2 ring-primary-500/20 border-primary-600`).
- **Error Presentation:** Red border (`--status-error-border`), inline helper text with alert icon below the input, and accessible `aria-invalid="true"`.

---

## 6. Motion & Micro-Interactions

- **Timing Function:** `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- **Durations:**
  - Fast (120ms): Button hover, tooltip fade, checkbox check.
  - Standard (200ms): Dropdown menu popover, tab switch transition.
  - Structural (300ms): Slide-over drawer entry, sidebar collapse/expand.
- **Reduced Motion:** If `prefers-reduced-motion: reduce`, all transitions instantly resolve (`duration: 0ms`).

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout Adjustments |
|---|---|---|
| **Mobile (`< 640px`)** | 360px–639px | Sidebar collapses into bottom navigation or hamburger drawer; tables convert into stacked card lists; stat cards span 100%. |
| **Tablet (`640px – 1023px`)** | 640px–1023px | Sidebar icon-only (68px); 2-column KPI card grid; drawers take 85% screen width. |
| **Desktop (`1024px – 1439px`)** | 1024px–1439px | Full sidebar (256px); 4-column KPI grid; standard 540px drawer width. |
| **Wide Desktop (`≥ 1440px`)** | 1440px+ | Max container bounds (1400px centered), split-screen grading views comfortable. |
