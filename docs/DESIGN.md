# Karma — Design System & Screen Specification (DESIGN.md)

> **Design System for Stitch MCP & Frontend Engineering**
> 
> **Product:** Karma — School Management & Learning Platform (SaaS Multi-Tenant Modular Monolith)
> **Visual Identity:** Modern, clean, premium educational SaaS, calm, accessible, data-informed. Not legacy ERP.
> **Supported Locales:** English (`en`, LTR) & Arabic (`ar`, RTL) from day one.

---

## 1. Visual Identity & Brand Philosophy

- **Tone & Mood:** Professional, trustworthy, structured, calm, and uncluttered. High clarity with data-dense information architectures presented gracefully.
- **Design Metaphor:** Modern workspace meets academic hub. Card-based surfaces with subtle border definitions, crisp typography, and intuitive logical spacing.
- **RTL & Bilingual First:** Layouts and components are designed with CSS logical properties (`margin-inline`, `padding-inline`, `start`/`end`). Directional components (sidebars, breadcrumbs, tables, steps, chevrons) mirror naturally in Arabic.

---

## 2. Design Tokens

### 2.1 Color Palette

| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--color-primary` | `#2563eb` (Blue 600) | `#3b82f6` (Blue 500) | Primary brand actions, active links, primary buttons |
| `--color-primary-foreground` | `#ffffff` | `#ffffff` | Text on primary brand colors |
| `--color-primary-hover` | `#1d4ed8` (Blue 700) | `#60a5fa` (Blue 400) | Hover state for primary actions |
| `--color-secondary` | `#f1f5f9` (Slate 100) | `#1e293b` (Slate 800) | Secondary surfaces, button secondary |
| `--color-secondary-foreground` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Text on secondary surfaces |
| `--color-accent` | `#0ea5e9` (Sky 500) | `#38bdf8` (Sky 400) | Badges, highlights, active indicators |
| `--color-background` | `#f8fafc` (Slate 50) | `#0b0f17` (Slate 950) | Global app background |
| `--color-surface` | `#ffffff` (White) | `#111827` (Gray 900) | Cards, panels, drawers, modals |
| `--color-surface-elevated` | `#ffffff` | `#1f2937` (Gray 800) | Dropdowns, popovers, tooltips |
| `--color-text-primary` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Headings, primary body copy |
| `--color-text-secondary` | `#475569` (Slate 600) | `#94a3b8` (Slate 400) | Captions, labels, secondary metadata |
| `--color-text-muted` | `#94a3b8` (Slate 400) | `#64748b` (Slate 500) | Placeholder text, disabled labels |
| `--color-border` | `#e2e8f0` (Slate 200) | `#334155` (Slate 700) | Card borders, dividers, table borders |
| `--color-border-subtle` | `#f1f5f9` (Slate 100) | `#1e293b` (Slate 800) | Row separators, faint borders |

#### Status & Semantic Colors
- **Success (`#10b981` / Emerald 500):** Published, Present, Graded, Active, On-time.
- **Warning (`#f59e0b` / Amber 500):** Late submission, Upcoming due date, In-progress, Trialing.
- **Error / Danger (`#ef4444` / Red 500):** Absent, Overdue, Cancelled, Expired, Limit reached.
- **Info (`#6366f1` / Indigo 500):** Excused, Scheduled, Announcements, Info toasts.

---

### 2.2 Typography

* **Latin UI Face:** Inter / Geist Sans (`font-sans`) — crisp geometry, high x-height for dashboard data.
* **Arabic UI Face:** IBM Plex Sans Arabic / Readex Pro — harmonious stroke weight matching Latin counterparts.

| Scale | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **Display** | 32px (`2rem`) | 38px | Bold (700) | Welcome banners, key statistics |
| **H1** | 24px (`1.5rem`) | 32px | Semibold (600) | Page titles |
| **H2** | 20px (`1.25rem`) | 28px | Semibold (600) | Section headers, card titles |
| **H3** | 16px (`1rem`) | 24px | Medium (500) | Modal headers, sub-sections |
| **Body** | 14px (`0.875rem`)| 20px | Regular (400) | Main content, table cells, form inputs |
| **Small** | 13px (`0.8125rem`)| 18px | Regular (400) | Secondary table info, tooltips |
| **Caption** | 12px (`0.75rem`)| 16px | Medium (500) | Badges, timestamps, helper text |

---

### 2.3 Spacing, Radii & Elevation

* **Spacing Grid:** 4px base scale (`space-1` = 4px, `space-2` = 8px, `space-3` = 12px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px).
* **Border Radii:**
  * `sm` (4px): Inputs, badges, small buttons.
  * `md` (8px): Cards, table rows, dropdowns, regular buttons.
  * `lg` (12px): Modals, drawers, major containers.
  * `full` (9999px): Avatars, pills, status dots.
* **Shadows:**
  * `shadow-sm`: Cards and table rows (`0 1px 2px 0 rgb(0 0 0 / 0.05)`).
  * `shadow-md`: Dropdown menus, popovers (`0 4px 6px -1px rgb(0 0 0 / 0.1)`).
  * `shadow-lg`: Drawers and modal dialogs (`0 10px 15px -3px rgb(0 0 0 / 0.1)`).

---

## 3. Core Component Patterns

1. **Drawers over Dedicated Pages:**
   * Creation and editing forms (e.g., Create Assignment, Edit Student, Record Attendance) open in a **Slide-over Drawer from the inline-end** (right in LTR, left in RTL). This keeps user context intact without losing filter/table position.
2. **Data Tables (`@tanstack/react-table`):**
   * Server-side paginated, searchable, with filter chips. Clear hover states, sticky headers, and action menus (`...`) on the inline-end.
3. **Role-Aware Dashboards:**
   * Uniform shell with customized metric widgets:
     * **Admin:** School health, enrollment stats, attendance rate, class comparisons.
     * **Teacher:** Today's timetable periods, pending grading queue, quick attendance actions.
     * **Student:** Next upcoming lessons, pending homework, published quiz scores.
     * **Parent:** Child switcher pill in top bar, attendance summary, recent results.
4. **State Handling:**
   * Every view explicitly renders: `Loading Skeleton`, `Empty State` (with actionable illustration/button), and `Error State` (with retry action).

---

## 4. Complete Screen Inventory (34 Screens)

### Group 1: Authentication & Onboarding (4 Screens)
1. `SCR-AUTH-01`: **Login & Role Switcher** — Email/password login with demo account one-click presets (Admin, Teacher, Student, Parent).
2. `SCR-AUTH-02`: **Accept Invitation / Set Password** — Onboarding screen for invited staff or parents.
3. `SCR-AUTH-03`: **Forgot Password** — Email submission for password reset link.
4. `SCR-AUTH-04`: **Reset Password** — New password entry with strength requirements.

### Group 2: Role-Aware Dashboards (1 Screen Shell with 4 Role Variants)
5. `SCR-DASH-01`: **Role Dashboard** —
   * *Admin View:* KPI cards (Students, Teachers, Classes, Avg Attendance), attendance trend chart, recent announcements, activity feed.
   * *Teacher View:* Today's schedule timeline, grading inbox counter, classes roster shortcuts.
   * *Student View:* Today's timetable, upcoming assignment deadlines, published grades, school events.
   * *Parent View:* Linked child switcher dropdown, child attendance meter, latest published term report card.

### Group 3: People & Profiles (5 Screens)
6. `SCR-PEOPLE-01`: **Students Directory** — Searchable table with filters (Grade, Class, Status), quick action to open "Enroll Student" drawer.
7. `SCR-PEOPLE-02`: **Student Details 360°** — Profile header (bilingual name, code, avatar) with 5 tabs: Overview, Attendance History, Assignments, Quizzes, Published Results.
8. `SCR-PEOPLE-03`: **Teachers Directory** — Grid/table of teaching staff with assigned subjects and class workload indicators.
9. `SCR-PEOPLE-04`: **Teacher Details** — Qualifications (`TeacherSubject`), assigned classes (`ClassSubject`), timetable grid.
10. `SCR-PEOPLE-05`: **Parents Directory** — Parent list with linked children tags, primary contact badges, and link/unlink child action.

### Group 4: Academic Structure & Scheduling (5 Screens)
11. `SCR-ACAD-01`: **Academic Years & Terms** — Timeline of school years (`2025/2026`), term order, active status badge, and dates.
12. `SCR-ACAD-02`: **Classes Management** — Grade-level cohorts (e.g. "Grade 10A"), capacity bars, homeroom teacher tag.
13. `SCR-ACAD-03`: **Class Details & Subject Roster** — Students enrolled in class, assigned subjects, and subject teachers.
14. `SCR-ACAD-04`: **Subjects Catalogue** — Subject list with codes, bilingual titles, and qualified teacher counts.
15. `SCR-ACAD-05`: **Interactive Timetable Grid** — Weekly schedule matrix (Sunday–Thursday) filterable by Class, Teacher, or Student Room. Conflict alert indicators for double bookings.

### Group 5: Learning & Content (4 Screens)
16. `SCR-LEARN-01`: **Lessons List** — Published & draft lesson cards grouped by subject and week.
17. `SCR-LEARN-02`: **Lesson Details & Resources** — Rich lesson content, downloadable attachments, linked timetable slot, and topic tags.
18. `SCR-LEARN-03`: **Assignments Center** — Assignment cards with due dates, late-window tags, submission progress meters.
19. `SCR-LEARN-04`: **Assignment Grading & Submission Review** — Split-view grading interface: student submission preview on left, rubric score & feedback drawer on right.

### Group 6: Assessment & Grading (4 Screens)
20. `SCR-ASSESS-01`: **Quizzes & Offline Exams Hub** — Dual-tab view for online quizzes and scheduled offline exams.
21. `SCR-ASSESS-02`: **Quiz Builder** — Interactive question composer (Multiple Choice & True/False), point assigner, time limit setter.
22. `SCR-ASSESS-03`: **Online Quiz Taking Experience (Student)** — Distraction-free quiz interface with server-synced countdown timer, question navigator, and answer submit guard.
23. `SCR-ASSESS-04`: **Results & Gradebook Dashboard** — Weighted grading scheme preview, term performance aggregations, and immutable Result publish trigger.

### Group 7: Attendance Tracking (2 Screens)
24. `SCR-ATTEND-01`: **Take Attendance Register** — Daily period roster with one-click toggles: `Present` (Green), `Absent` (Red), `Late` (Amber), `Excused` (Blue). Shows 24h edit window countdown.
25. `SCR-ATTEND-02`: **Attendance Analytics & History** — Heatmap of monthly attendance rates per class and individual student absence logs.

### Group 8: School Communication (3 Screens)
26. `SCR-COMM-01`: **Events Calendar** — Month/Week calendar with color-coded event types (Holidays, Exams, Trips, Parent Meetings) and audience pills.
27. `SCR-COMM-02`: **Announcements Board** — Feed of targeted school announcements with rich text and attachments.
28. `SCR-COMM-03`: **Notification Center** — Popover drawer and dedicated page with unread badge counter, categorized notification cards, and deep links.

### Group 9: Analytics & Reporting (2 Screens)
29. `SCR-INSIGHT-01`: **Executive Analytics Dashboard** — Deep charts: Grade performance distribution, term-over-term trends, attendance vs performance correlation.
30. `SCR-INSIGHT-02`: **Custom Report Builder** — Filter selector (Academic Year, Term, Class, Metric) with live table preview and CSV Export button.

### Group 10: EduAI & Administration (4 Screens)
31. `SCR-AI-01`: **EduAI Assistant Workspace** — Contextual chat panel with suggested role-specific prompt pills, streamed response cards, and tool-call citations.
32. `SCR-ADMIN-01`: **Organization & Plan Settings** — Active subscription badge (`SCHOOL`), resource usage meters (`Students 120/500`, `Teachers 18/50`, `Storage 1.2/5 GB`, `AI Requests 140/1000`).
33. `SCR-ADMIN-02`: **Audit Log Explorer** — Searchable, immutable event log (Actor, Action, Resource, Timestamp, Difference diff).
34. `SCR-USER-01`: **Profile & Account Preferences** — User info, avatar upload, language toggle (English / العربية), and theme switcher.

---

## 5. Stitch MCP Execution Strategy

To generate high-fidelity, production-grade screens in Stitch:

1. **Step 1: Upload DESIGN.md**
   * Call `upload_design_md` and `create_design_system_from_design_md` to establish the Karma design tokens in Stitch.
2. **Step 2: Generate 5 Anchor Screens**
   * `SCR-AUTH-01` (Login & Demo Switcher)
   * `SCR-DASH-01` (Admin Dashboard)
   * `SCR-PEOPLE-02` (Student Details 360°)
   * `SCR-LEARN-04` (Assignment Grading Drawer)
   * `SCR-ATTEND-01` (Take Attendance Register)
3. **Step 3: Generate Domain Screen Families**
   * Generate remaining screens following the established anchor patterns.
