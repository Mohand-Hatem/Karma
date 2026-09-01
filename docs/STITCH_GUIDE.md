# Karma — Stitch MCP Execution Guide

> **How to create the complete UI/UX design in Stitch using our design system and screen prompts.**

---

## 1. Overview of Generated Design Assets

We have prepared two comprehensive files:

1. [`docs/DESIGN.md`](./DESIGN.md) — **The Master Design System & Token Authority**
   * Contains complete CSS color tokens (Light & Dark mode), typography pairing (Inter/Geist + IBM Plex Sans Arabic), 8-point spacing system, elevation shadows, WCAG 2.2 AA accessibility rules, and component patterns (Sidebars, Topbars, Slide-over Drawers, Data Tables).
2. [`docs/STITCH_SCREEN_PROMPTS.md`](./STITCH_SCREEN_PROMPTS.md) — **The 34-Screen Prompt Catalog**
   * Contains exact, high-fidelity prompts for all 34 screens divided into 10 domain groups, with detailed layouts, data widgets, interactive states, and role definitions.

---

## 2. Step-by-Step Stitch Execution Workflow

To ensure Stitch generates screens that are visually unified and adhere to our design tokens:

### Step 1: Initialize Project & Upload Design System
1. Run `create_project` in Stitch (Name: `"Karma School Management"`).
2. Run `upload_design_md` with the content of [`docs/DESIGN.md`](./DESIGN.md).
3. Run `create_design_system_from_design_md` to compile and display the design tokens in Stitch.

### Step 2: Generate the 5 Anchor Screens First
Do **not** generate all 34 screens simultaneously. Generate the **5 Anchor Screens** first so Stitch learns our layout structure, card styles, and drawer patterns:

1. `SCR-AUTH-01`: **Login & Role Switcher** (sets brand color & typography)
2. `SCR-DASH-01`: **Admin Dashboard** (sets navigation sidebar, topbar, KPI cards, Recharts containers)
3. `SCR-PEOPLE-02`: **Student Details 360° Profile** (sets tabs, tables, status badges)
4. `SCR-LEARN-04`: **Assignment Grading Drawer** (sets the 600px slide-over drawer pattern)
5. `SCR-ATTEND-01`: **Take Attendance Register** (sets interactive action tables and 24h countdown badge)

### Step 3: Generate Remaining Screen Families
Once the 5 anchors are established, generate the rest of the screens using the exact prompts from [`docs/STITCH_SCREEN_PROMPTS.md`](./STITCH_SCREEN_PROMPTS.md):

* **Batch 1 (Auth):** `SCR-AUTH-02`, `SCR-AUTH-03`, `SCR-AUTH-04`
* **Batch 2 (Dashboards):** `SCR-DASH-02` (Teacher), `SCR-DASH-03` (Student), `SCR-DASH-04` (Parent)
* **Batch 3 (People):** `SCR-PEOPLE-01` (Students list), `SCR-PEOPLE-03` (Teachers list), `SCR-PEOPLE-04`, `SCR-PEOPLE-05`
* **Batch 4 (Academic):** `SCR-ACAD-01` (Academic years), `SCR-ACAD-02` (Classes), `SCR-ACAD-03`, `SCR-ACAD-04`, `SCR-ACAD-05` (Timetable matrix)
* **Batch 5 (Learning & Grading):** `SCR-LEARN-01`, `SCR-LEARN-02`, `SCR-LEARN-03`, `SCR-ASSESS-01`, `SCR-ASSESS-02` (Quiz builder), `SCR-ASSESS-03` (Quiz taking), `SCR-ASSESS-04` (Gradebook snapshot)
* **Batch 6 (Attendance & Communication):** `SCR-ATTEND-02`, `SCR-COMM-01` (Calendar), `SCR-COMM-02`, `SCR-COMM-03`
* **Batch 7 (Insights & Admin):** `SCR-INSIGHT-01`, `SCR-INSIGHT-02`, `SCR-AI-01` (EduAI chat), `SCR-ADMIN-01` (SaaS usage meters), `SCR-ADMIN-02` (Audit log), `SCR-USER-01`

---

## 3. Stitch MCP Command Reference

If you want me (or any AI agent) to trigger Stitch MCP directly, the exact sequence of tool calls is:

```json
// 1. Create project
call_mcp_tool("stitch", "create_project", { "name": "Karma - School Management" })

// 2. Upload Design System
call_mcp_tool("stitch", "upload_design_md", { 
  "projectId": "<projectId>", 
  "designMdBase64": "<base64_of_docs/DESIGN.md>" 
})

// 3. Register Design System
call_mcp_tool("stitch", "create_design_system_from_design_md", {
  "projectId": "<projectId>",
  "selectedScreenInstance": { ... }
})

// 4. Generate Screen
call_mcp_tool("stitch", "generate_screen_from_text", {
  "projectId": "<projectId>",
  "prompt": "<Prompt from STITCH_SCREEN_PROMPTS.md>"
})
```
