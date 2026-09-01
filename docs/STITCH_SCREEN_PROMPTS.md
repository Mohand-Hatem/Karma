# Karma — Stitch Screen Prompt Playbook (34 Screens)

> **Complete catalog of prompts to generate the full Karma design in Stitch MCP.**
> All prompts adhere to [`docs/DESIGN.md`](./DESIGN.md) design tokens, layout hierarchy, and bilingual RTL requirements.

---

## Table of Contents

- [Phase A: The 5 Anchor Screens (Generate First)](#phase-a-the-5-anchor-screens)
- [Phase B: Authentication & Onboarding (4 Screens)](#phase-b-authentication--onboarding)
- [Phase C: Role-Aware Dashboards (4 Views)](#phase-c-role-aware-dashboards)
- [Phase D: People & Profiles (5 Screens)](#phase-d-people--profiles)
- [Phase E: Academic Structure & Scheduling (5 Screens)](#phase-e-academic-structure--scheduling)
- [Phase F: Learning & Content (4 Screens)](#phase-f-learning--content)
- [Phase G: Assessment & Grading (4 Screens)](#phase-g-assessment--grading)
- [Phase H: Attendance Tracking (2 Screens)](#phase-h-attendance-tracking)
- [Phase I: School Communication (3 Screens)](#phase-i-school-communication)
- [Phase J: Analytics & Reports (2 Screens)](#phase-j-analytics--reports)
- [Phase K: EduAI & Administration (4 Screens)](#phase-k-eduai--administration)

---

## Phase A: The 5 Anchor Screens

Generate these first so Stitch establishes the global design system, typography, card shapes, and drawer patterns.

---

### `SCR-AUTH-01`: Login & Demo Role Switcher
- **Target Role:** Public / Unauthenticated
- **Goal:** Clean, trustworthy authentication portal with one-click demo presets for portfolio evaluation.
- **Stitch Prompt:**
```text
A modern SaaS login page for "Karma" (School Management Platform) on desktop (1440px). 
Split layout: Left side (55% width) has a clean, subtle slate gradient (#f8fafc to #f1f5f9) background featuring the Karma logo (modern indigo emblem), headline "School management, built for how schools actually run", and a subtle preview card showing an academic KPI chart. 
Right side (45% width) contains a centered card with:
- Top bar with a clean language switcher dropdown ("English" / "العربية") and light/dark toggle.
- "Welcome back" heading with subtitle "Sign in to your school account".
- Email input field and Password input field (with eye toggle) using 1px slate-200 borders and rounded-md corners.
- "Remember me" checkbox and "Forgot password?" link in primary indigo (#2563eb).
- Primary "Sign In" button (solid blue, full width, hover state).
- Divider "Or explore with a demo account".
- 4 quick-login demo pill buttons in a 2x2 grid:
  1. [Admin] "Sarah Jenkins (Principal)"
  2. [Teacher] "Ahmed Hassan (Physics)"
  3. [Student] "Omar Hatem (Grade 10)"
  4. [Parent] "Mariam Hatem (Parent)"
Design is ultra-clean, minimal, accessible, and matches Stripe/Linear design standards.
```

---

### `SCR-DASH-01`: Admin Dashboard (Master App Shell)
- **Target Role:** Admin (Principal / School Manager)
- **Goal:** High-level school operational health, attendance overview, and quick academic actions.
- **Stitch Prompt:**
```text
Full desktop application dashboard for "Karma" School Management Platform (1440px width).
App Shell Layout:
- Left Sidebar (256px, dark slate or crisp white with 1px border): Karma Logo, Academic Year selector dropdown ("2025/2026 - Active"), navigation links with Lucide icons (Dashboard [active], Students, Teachers, Classes, Timetable, Lessons, Assignments, Results, Attendance, Announcements, Analytics, Settings), and user profile badge at the bottom.
- Top Navbar: Breadcrumbs ("Dashboard / Overview"), Global Search bar (⌘K shortcut), Active Organization badge ("Al-Amal International Academy"), Language Switcher ("EN / AR"), Notification bell with red dot badge (3), and User Avatar dropdown.
Main Content Area (Slate-50 background):
- Page Header: "School Overview" with date range picker ("Term 1 - 2025/2026") and primary action button "+ Quick Action" (Invite Staff, Enroll Student, Send Announcement).
- Top 4 Metric KPI Cards (grid of 4):
  1. Total Students: "1,248" (+12 this term) with subtle blue sparkline.
  2. Total Teachers: "84" (100% assigned) with workload meter.
  3. Average Attendance: "94.6%" (green badge +1.2% vs last week) with circular progress indicator.
  4. Average Term Performance: "82.4%" (Grade B+ average) with mini bar chart.
- Middle Row (2 columns: 65% / 35%):
  - Left (65%): Card "Attendance & Performance Trends" with Recharts multi-line chart (Attendance % vs Grade Average across weeks) and filter tabs (Week, Month, Term).
  - Right (35%): Card "Upcoming Events & Exams" with dated list items (Midterm Physics Exam on Oct 14, Parent-Teacher Conference on Oct 18).
- Bottom Row: "Recent Academic Activity" data table showing latest published results and class transfers with status badges (Published, Enrolled, Transfer).
Clean 8px grid spacing, rounded-lg card corners, subtle 1px slate-200 borders, no cluttered shadows.
```

---

### `SCR-PEOPLE-02`: Student Details 360° Profile
- **Target Role:** Admin & Teacher
- **Goal:** Comprehensive academic and operational record for an individual student.
- **Stitch Prompt:**
```text
Desktop screen for Student Profile 360° ("Omar Hatem - ID: STU-2026-0042") in Karma.
App Shell Header: Breadcrumb ("Students / Grade 10A / Omar Hatem").
Top Profile Header Card (White surface, rounded-xl, 1px border):
- Left: Large student avatar with online badge, bilingual name ("Omar Hatem / عمر حاتم"), Student Code "STU-2026-0042", Grade Level badge "Grade 10 - Class 10A", Status badge "ACTIVE" (emerald).
- Right: Quick stats pills: Homeroom Teacher "Mr. David Miller", Attendance "96.2%", GPA "3.85 / 4.0", Linked Parent "Mariam Hatem (Mother - Primary)".
- Actions: "Edit Profile" (secondary) and "Export Report" (outline).
Tab Navigation Bar:
5 Tabs: [1. Academic Overview (active), 2. Attendance History, 3. Assignments & Homework, 4. Quizzes & Exams, 5. Published Results].
Active Tab Content (Academic Overview):
- Left Column (60%):
  - Card "Enrolled Subjects & Teachers" with 6 subject rows (Physics, Pure Math, English Literature, Chemistry, History, Computer Science) showing current teacher name, term mark, and recent assignment score.
  - Card "Recent Submissions" list with status pills (Graded 95/100, Submitted On-time, Graded 88/100).
- Right Column (40%):
  - Card "Attendance Breakdown": donut chart (94% Present, 4% Late, 2% Excused).
  - Card "Parent & Emergency Contact": Mother's phone number, email, address, and quick email button.
Polished UI, crisp typography, accessible high contrast text, Tailwind CSS v4 styling.
```

---

### `SCR-LEARN-04`: Assignment Grading & Review (Slide-Over Drawer)
- **Target Role:** Teacher
- **Goal:** Review student submitted work, grade against max score, and provide rich teacher feedback.
- **Stitch Prompt:**
```text
Desktop screen (1440px) showing the Assignment Submissions table in the background with a Slide-Over Grading Drawer open on the right (600px width).
Background (dimmed with 40% backdrop overlay):
- Submissions table for "Physics Lab Report #3: Newton's Laws" showing list of students with columns: Student Name, Submission Date, Status ("Graded", "Submitted", "Late"), Score.
Open Slide-Over Drawer (Right side, white surface, elevated shadow-2xl, 1px left border):
- Drawer Header: Student Name "Zainab Al-Fassi (10A)", Submission Status badge "LATE (Submitted 2h after due date)" in Amber-100/Amber-800 badge, Close 'X' button.
- Drawer Body (Scrollable):
  - Section 1: "Submitted Files" with attached PDF card "physics_lab_report_zainab.pdf (2.4 MB)" with download button and file preview icon.
  - Section 2: "Student Comments": blockquote "I completed the experiment on Tuesday, apologies for the slight delay in submission."
  - Section 3: "Grading & Evaluation":
    - Score input: Numeric input "88" out of "/ 100" (Max Score) with percentage conversion pill (88%).
    - Grade Category: "Lab Work (Weight: 25%)".
    - Rubric criteria mini checklist (Hypothesis [✓], Methodology [✓], Data Analysis [✓], Conclusion [Needs more detail]).
  - Section 4: "Teacher Feedback": Textarea with formatted feedback notes and quick-insert feedback snippet tags ("Great effort!", "Check calculations in section 3", "Improve graph labeling").
- Sticky Drawer Footer: Secondary button "Reopen for Resubmission", Secondary "Save Draft", and Primary button "Publish Grade" (Solid blue).
Clean, functional, highly productive teacher workflow.
```

---

### `SCR-ATTEND-01`: Take Attendance Register (Daily Period)
- **Target Role:** Teacher & Admin
- **Goal:** Fast, error-free attendance marking for a specific scheduled timetable period with 24-hour edit countdown.
- **Stitch Prompt:**
```text
Desktop screen for taking classroom attendance in Karma platform (1440px).
Page Header:
- Title: "Attendance Register: Grade 10A — Physics (Period 2: 09:15 – 10:00 AM)"
- Subtitle: "Sunday, Oct 12, 2026 | Room 204 | Teacher: Ahmed Hassan"
- Right: Countdown Banner badge "24-Hour Teacher Edit Window Active (23h 45m remaining)" in emerald-50 with clock icon.
- Action Bar: "Mark All Present" quick button, "Filter by Status", Search student by name.
Main Interactive Roster Table (White card, rounded-xl, 1px border):
- Columns: #, Student Photo & Name (Bilingual), Student Code, Quick Status Selector, Absence/Late Note, History Summary.
- Rows (25 students): Each row has a prominent 4-button segmented status control:
  1. [P] Present (Solid Green when selected)
  2. [A] Absent (Solid Red when selected)
  3. [L] Late (Solid Amber when selected - prompts for arrival minute e.g. "12m late")
  4. [E] Excused (Solid Blue when selected - prompts for medical note tag)
- Bottom Sticky Action Summary Bar:
  - Live Counter: "Total: 25 | Present: 22 (88%) | Absent: 2 | Late: 1 | Excused: 0"
  - Actions: "Save as Draft" and Primary "Submit Register" with confirmation tooltip.
Intuitive keyboard accessibility indicators and high-contrast status colors.
```

---

## Phase B: Authentication & Onboarding (4 Screens)

### `SCR-AUTH-02`: Accept Invitation & Onboarding
- **Stitch Prompt:**
```text
Clean single-column onboarding screen for an invited school user on Karma.
Card in center of screen (500px width):
- School Logo and Invitation Badge "You have been invited to join Al-Amal Academy as Teacher".
- Pre-filled email address "ahmed.hassan@alamal.edu".
- Full Name input (English & Arabic optional).
- Password and Confirm Password inputs with live strength checklist (8+ chars, uppercase, number, symbol).
- Timezone selector (default "Africa/Cairo (UTC+2)") and preferred language toggle.
- Primary button "Complete Account Setup & Enter Dashboard".
```

### `SCR-AUTH-03`: Forgot Password
- **Stitch Prompt:**
```text
Minimal password recovery page for Karma.
Centered card (440px): Key icon header, "Reset your password", description "Enter your registered school email and we'll send you instructions to reset your password", Email input field, "Send Reset Link" primary button, and "← Back to login" link.
```

### `SCR-AUTH-04`: Reset Password
- **Stitch Prompt:**
```text
Password reset confirmation page for Karma.
Centered card (440px): Lock icon header, "Set new password", New password input, Confirm password input, security requirements checklist, and "Reset Password & Sign In" button.
```

---

## Phase C: Role-Aware Dashboards (Remaining 3 Views)

### `SCR-DASH-02`: Teacher Dashboard
- **Stitch Prompt:**
```text
Teacher daily workspace dashboard for Karma platform.
App Shell with Teacher navigation.
Top Section: "Welcome back, Mr. Ahmed Hassan" with today's schedule banner.
Grid Layout:
- Left (65%):
  - "Today's Teaching Schedule" (Timeline of 4 periods with Room numbers, Class links, and quick button "Take Attendance" on current period).
  - "Pending Grading Queue" table showing 3 assignments with unreviewed submissions and progress bars (e.g. 18/25 graded).
- Right (35%):
  - "My Classes" cards (Grade 10A Physics, Grade 11B Physics) with student counts.
  - "Upcoming Deadlines & Quizzes" widget.
```

### `SCR-DASH-03`: Student Dashboard
- **Stitch Prompt:**
```text
Student learning dashboard for "Omar Hatem (Grade 10A)".
Top Greeting: "Good morning, Omar! You have 2 assignments due this week."
Grid Layout:
- Left (65%):
  - "Today's Timetable" (Interactive horizontal schedule cards showing subject, time, room, and teacher).
  - "Upcoming Assignments & Homework" cards with due date countdown badges (Due Tomorrow, Due in 3 days) and "Start Submission" buttons.
  - "Recent Quiz Results" widget.
- Right (35%):
  - "My Attendance Rate" circle meter (96.5%).
  - "School Announcements & Events" feed with dates and attachment icons.
```

### `SCR-DASH-04`: Parent Dashboard
- **Stitch Prompt:**
```text
Parent monitoring dashboard for "Mariam Hatem (Parent of 2 students)".
Top Bar: Prominent Child Switcher Segmented Control: [Omar Hatem - Grade 10A (Selected)] | [Sara Hatem - Grade 7B].
Main Grid for Selected Child (Omar):
- Top 3 Summary Cards: Overall GPA (3.85 / A), Term Attendance (96.2%), Missing Submissions (0).
- Left (60%):
  - "Recent Published Term Grades" card with subject breakdown and teacher comments.
  - "Upcoming Exams & Due Dates" list for Omar.
- Right (40%):
  - "Attendance Calendar" month view highlighting present/late days.
  - "Teacher Communications & School Notices".
```

---

## Phase D: People & Profiles (Remaining 4 Screens)

### `SCR-PEOPLE-01`: Students Directory List
- **Stitch Prompt:**
```text
Students Directory page in Karma (Admin view).
Header: "Students Directory (1,248 students)" with buttons "+ Enroll Student" and "Export CSV".
Filter Toolbar: Search by name/code, Grade Level filter dropdown, Class filter, Status filter (Active, Transferred, Archived).
Data Table: Columns for Student Photo/Name, Code, Grade & Class, Primary Parent, Attendance %, Status badge, and Actions dropdown (...).
Pagination footer at bottom.
```

### `SCR-PEOPLE-03`: Teachers Directory
- **Stitch Prompt:**
```text
Teachers Management page for Admin.
Header: "Teaching Staff (84 Teachers)" with "+ Invite Teacher" button.
Grid of Teacher Cards: Each card displays Teacher Avatar, Bilingual Name, Specialization badge ("Physics / Pure Math"), Assigned Classes pills ("10A, 10B, 11A"), Weekly Teaching Hours (18 hrs/week), and "View Profile" link.
```

### `SCR-PEOPLE-04`: Teacher Details
- **Stitch Prompt:**
```text
Teacher detailed profile page ("Mr. Ahmed Hassan - Physics").
Header with teacher info, qualifications list (`TeacherSubject`), contact details, and assigned classes list.
Main Area: Personal weekly teaching timetable grid and performance summary of classes taught.
```

### `SCR-PEOPLE-05`: Parents Directory
- **Stitch Prompt:**
```text
Parents Management directory for Admin.
Table showing Parent Name, Email, Phone, Linked Children tags with relationship badges (e.g. "Omar Hatem [Son - Primary]", "Sara Hatem [Daughter]"), and "+ Link Child" modal trigger.
```

---

## Phase E: Academic Structure & Scheduling (5 Screens)

### `SCR-ACAD-01`: Academic Years & Terms
- **Stitch Prompt:**
```text
Academic Years management page in Karma.
Timeline view of School Years: Active year card ("2025/2026 - CURRENT ACTIVE") with green badge, start/end dates, and sub-term cards (Term 1: Sep–Dec, Term 2: Jan–Mar, Term 3: Apr–Jun).
Buttons for "+ Add Academic Year" and "Configure Terms".
```

### `SCR-ACAD-02`: Classes Management
- **Stitch Prompt:**
```text
Classes management grid (Grade 1 to 12).
Class cards grouped by Grade Level (e.g. "Grade 10: Class 10A, Class 10B, Class 10C").
Each class card shows enrolled student count / capacity (e.g. "28/30 students"), Homeroom Teacher name, and action button "Manage Roster".
```

### `SCR-ACAD-03`: Class Details & Student Roster
- **Stitch Prompt:**
```text
Class detailed view ("Class 10A - Academic Year 2025/2026").
Tabs for [Student Roster (28 students), Assigned Subject Teachers, Class Timetable].
Roster table with student transfer and enrollment action buttons.
```

### `SCR-ACAD-04`: Subjects Catalogue
- **Stitch Prompt:**
```text
School Subjects Catalogue page.
Table of subjects with Subject Code ("PHY-101"), Subject Name (English & Arabic), Department, Number of qualified teachers, and assigned classes. "+ Add Subject" button.
```

### `SCR-ACAD-05`: Interactive Timetable Grid
- **Stitch Prompt:**
```text
Comprehensive weekly timetable matrix for Karma (1440px).
Header filters: Select View Mode [By Class | By Teacher | By Room], Academic Year, and active cohort.
Weekly Grid (Sunday to Thursday, 7 Periods per day: 08:00 AM to 03:00 PM).
Color-coded slot cards showing Subject Name, Teacher Name, Room Number, and conflict detection alert badge if a teacher/room is double-booked. Drag-and-drop slot adjustment handles.
```

---

## Phase F: Learning & Content (Remaining 3 Screens)

### `SCR-LEARN-01`: Lessons List
- **Stitch Prompt:**
```text
Lessons archive and planner page.
Filtered by Subject ("Grade 10 Physics").
Grouped by Week/Unit cards. Lesson cards show Lesson Title, Scheduled Date, Linked Timetable period, Status badge ("Published" in emerald / "Draft" in slate), and attached resource pills (PDF, Video link).
```

### `SCR-LEARN-02`: Lesson Details & Resources
- **Stitch Prompt:**
```text
Single lesson content view ("Lesson 4: Circular Motion & Gravitation").
Rich text article format with formulas, embedded diagram image, downloadable PDF resources list, linked homework assignment card, and student completion toggle.
```

### `SCR-LEARN-03`: Assignments Center
- **Stitch Prompt:**
```text
Assignments management list.
Table and card view of assignments with Subject, Due Date, Late Submission Window badge, Submission counts progress bar (e.g. "24/28 Submitted"), Graded count ("18 Graded"), and action "+ Create Assignment".
```

---

## Phase G: Assessment & Grading (Remaining 3 Screens)

### `SCR-ASSESS-01`: Quizzes & Offline Exams Hub
- **Stitch Prompt:**
```text
Assessment Center page with two main tabs: [Online Quizzes] and [Offline Scheduled Exams].
Table of assessments with Max Marks, Weighted Category tag ("Midterm Exams 30%"), Date/Time, and Status.
```

### `SCR-ASSESS-02`: Quiz Builder (Interactive Composer)
- **Stitch Prompt:**
```text
Interactive Quiz Builder tool for Teachers.
Header: Quiz Title input, Subject selector, Time limit input ("45 minutes"), Grade Category selector.
Question Builder list:
- Question 1 (Multiple Choice): Question prompt textarea, 4 option rows with radio buttons to select `isCorrect` answer key, points value ("5 pts").
- Question 2 (True/False): Statement prompt with [True / False] toggle.
"+ Add Question" button and sticky "Publish Quiz" action.
```

### `SCR-ASSESS-03`: Online Quiz Taking Experience (Student)
- **Stitch Prompt:**
```text
Distraction-free, full-screen quiz taking interface for students.
Top Fixed Bar: Quiz Title "Physics Midterm Quiz 1", Progress indicator ("Question 4 of 20"), and live Server-authoritative Countdown Timer ("34:12 remaining" in amber badge).
Main Area: Question card with clear prompt, large accessible radio options (A, B, C, D).
Bottom Nav: "Previous Question", Question Grid Navigator drawer, and "Submit Quiz" button with confirmation alert.
```

---

## Phase H: Attendance Tracking (Remaining 1 Screen)

### `SCR-ATTEND-02`: Attendance Analytics & Heatmap
- **Stitch Prompt:**
```text
School-wide Attendance Analytics page for Admin.
Filters for Academic Year, Term, and Class.
Visual Monthly Heatmap grid showing attendance rate per day, Bar chart comparing class attendance rates across Grade 10, and list of students flagged for chronic absenteeism (<85%).
```

---

## Phase I: School Communication (3 Screens)

### `SCR-COMM-01`: Events Calendar
- **Stitch Prompt:**
```text
Full-screen interactive Events Calendar for school activities.
Month and Week grid view with color-coded event badges (Blue: School Events, Red: Holidays, Amber: Exams, Purple: Parent Meetings).
Audience pill tags on events (e.g. "All School", "Grade 10 Only", "Teachers Only").
"+ Create Event" drawer trigger.
```

### `SCR-COMM-02`: Announcements Board
- **Stitch Prompt:**
```text
School Announcements stream page.
Feed of announcement cards with Author avatar/role, Published timestamp, Audience scope badge, Rich text body, Attached PDF documents, and Admin edit/delete controls.
```

### `SCR-COMM-03`: Notification Center
- **Stitch Prompt:**
```text
Dedicated Notification Center and side drawer view.
Tabs for [All Notifications, Unread, Academic, Alerts].
Notification cards with unread blue dot, translation-friendly icon, actionable message (e.g. "Physics Lab Report #3 has been graded: 92/100"), timestamp, and "Mark all as read" button.
```

---

## Phase J: Analytics & Reports (2 Screens)

### `SCR-INSIGHT-01`: Executive Analytics Dashboard
- **Stitch Prompt:**
```text
High-level executive analytics dashboard for school leadership.
Charts layout:
1. Grade distribution bell curve across terms.
2. Subject-by-Subject performance comparison radar chart.
3. Attendance vs GPA scatter correlation chart.
4. Export summary report button.
```

### `SCR-INSIGHT-02`: Custom Report Builder
- **Stitch Prompt:**
```text
Report Generator interface in Karma.
Configuration Panel: Select Scope [School-wide | Specific Class | Subject], Academic Year, Term, and Report Type (Attendance Summary, Grade Card, Progress Report).
Live preview table with generated columns and prominent "Export to CSV" / "Download Report" button.
```

---

## Phase K: EduAI & Administration (4 Screens)

### `SCR-AI-01`: EduAI Assistant Workspace
- **Stitch Prompt:**
```text
EduAI Chat Assistant workspace interface.
Left: Conversation history sidebar with previous chat sessions.
Center: Modern AI chat interface. Top disclaimer: "EduAI operates with role-scoped permissions and real school data".
Suggested prompt chips (e.g. "Which students in 10A have attendance below 80%?", "Explain circular motion formula").
Message thread with streamed markdown responses, tool execution citation badge ("Queried Class 10A Attendance Service"), and monthly AI request usage meter badge at the top ("140 / 1,000 requests used").
```

### `SCR-ADMIN-01`: Organization & Plan Settings
- **Stitch Prompt:**
```text
Organization & SaaS Plan overview page for Admin.
Card 1: School Profile (Name, Slug, Timezone "Africa/Cairo", Default Locale "EN").
Card 2: Subscription & Plan Tier: "School Plan (Active)" with 4 live resource usage meters:
  - Students: 120 / 500 (Progress bar)
  - Teachers: 18 / 50
  - Storage: 1.2 GB / 5.0 GB
  - AI Requests: 140 / 1,000 per month
Read-only SaaS view matching portfolio blueprint.
```

### `SCR-ADMIN-02`: Audit Log Explorer
- **Stitch Prompt:**
```text
Security and operational Audit Log page for Admin.
Searchable, immutable table with columns: Timestamp (UTC), Actor (Avatar + Name + Role), Action (e.g. "RESULT_PUBLISHED", "ATTENDANCE_OVERRIDDEN", "USER_INVITED"), Resource Type, Resource ID, Reason, and JSON Before/After Diff viewer drawer.
```

### `SCR-USER-01`: Profile & Account Preferences
- **Stitch Prompt:**
```text
User Account Settings screen.
Personal Info card (Avatar upload, Name, Email, Password change form), Preferences card (Language selector: English / العربية with RTL toggle, Theme: Light / Dark / System), and active login sessions list with "Revoke Session" buttons.
```
