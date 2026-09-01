# Karma — Domain Glossary

> One term, one meaning, everywhere: Prisma models, API paths, frontend features, tests, and AI
> tool names. If a word is not in this list, it is not a domain term — do not invent synonyms.

## Resolved ambiguities

These pairs caused real confusion in the blueprint and are now decided.

| Ambiguity | Resolution |
|---|---|
| **Grade** vs **Mark** vs **Result** | There is **no `Grade` model and no `Mark` model.** A raw score lives on the record that produced it (`AssignmentSubmission.score`, `QuizAttempt.score`, `ExamMark.score`). `Result` is the *published, frozen aggregate*. "Grade" is used only as informal English, never as an entity. |
| **Term** vs **Semester** | **Term** is the entity. "Semester" is a colloquial synonym and must not appear in code, columns, or API paths. |
| **Class** vs **Section** | **Class** is the entity (e.g. "10A") and is scoped to one academic year. `section` is an optional label field on it ("A"), not a separate model. |
| **Session** (two meanings) | **Attendance Session** = one register-taking event. **Auth Session** = a Better Auth login session. Never write bare "session" in a domain context; always qualify. |
| **Assignment** vs **Quiz** vs **Exam** | Three distinct models, never interchangeable. See below. |
| **Enrollment** vs **Assignment** (of a teacher) | Students are **enrolled**. Teachers are **assigned**. Never "assign a student" or "enroll a teacher". |

---

## Core terms

**Organization** — The tenant root. One school. Every domain record belongs to exactly one. The MVP
seeds a single organization; the schema supports many.

**Academic Year** — A named school year (`"2025/2026"`) with a start and end date. Exactly one is
`ACTIVE` per organization. Classes, enrollments, and timetables all hang off it.

**Term** — A subdivision of an academic year with an `order` (1, 2, 3…) and a date range. Terms do
not overlap. Results are published *per term*. **Never called a semester.**

**Class** — A cohort of students for one academic year: "10A" in 2025/2026. A new row exists for
"10A" in 2026/2027; they are different classes. Carries `gradeLevel` (1–12) and an optional
`section` label.

**Grade Level** — The numeric year of study (1–12). A field on `Class`, not an entity. Distinct from
a *grade* meaning a score — which is why score-as-grade is banned above.

**Subject** — A taught discipline ("Mathematics"). **Not** year-scoped; the same subject persists
across years.

**ClassSubject** — The spine of the academic model: *this class studies this subject, taught by this
teacher, in this academic year*. Lessons, assignments, quizzes, exams, timetable slots, grading
schemes, and attendance all attach to a `ClassSubject`, never to a loose class + subject pair.

**TeacherSubject** — A teacher's **qualification** to teach a subject. Distinct from `ClassSubject`,
which is an actual **assignment**. A teacher must be qualified before being assigned.

**Enrollment** — A student's membership in a class for an academic year (`StudentEnrollment`). A
student has exactly one active enrollment per academic year. Mid-year transfers close one enrollment
and open another.

**Timetable Slot** — A recurring weekly period: this `ClassSubject`, on this weekday, from this start
minute to this end minute, in this room. The schedule skeleton.

**Lesson** — A single unit of teaching content with a scheduled date, attached to a `ClassSubject`.
Publishable. May reference the timetable slot it occupies. A lesson is **content**; a timetable slot
is **time**.

**Assignment** — Work set by a teacher for a `ClassSubject`, with a due date and an optional late
window. Graded manually.

**Submission** — A student's response to an assignment (`AssignmentSubmission`). Carries the score
and the teacher's feedback. One row per student per assignment; resubmission increments
`attemptNumber`.

**Quiz** — An **online, auto-graded** assessment. Multiple-choice and true/false only. Server-timed,
single attempt.

**Question / Option** — A quiz's items and their choices. `QuizOption.isCorrect` is the answer key
and must never reach a student client.

**Attempt** — A student's run at a quiz (`QuizAttempt`). Has a server-authoritative `expiresAt` set
at start.

**Answer** — A student's selected option for one question in one attempt (`QuizAnswer`). Immutable
once the attempt is submitted.

**Exam** — An **offline, scheduled** assessment. No online attempt; the teacher enters marks
directly.

**Exam Mark** — One student's score on one exam (`ExamMark`). This is the only place the word "mark"
appears, and it means exactly this.

**Grading Scheme** — The rules for computing a subject grade for one `ClassSubject`: a set of
weighted categories.

**Grade Category** — A weighted bucket within a grading scheme ("Assignments 20%", "Exams 50%").
Every graded item belongs to exactly one. Weights within a scheme sum to 100.

**Result** — A **published, immutable snapshot** of a student's computed grade for one
`ClassSubject` in one term. Append-only and versioned: corrections create version N+1 and supersede
the previous row. Carries a `breakdown` of the per-category math at publish time, so the number
stays explainable even if source records change later.

**Attendance Session** — One register-taking event: a timetable slot on a specific date, recorded by
a teacher. Has an edit window frozen at creation.

**Attendance Entry** — One student's status within one attendance session: `PRESENT`, `ABSENT`,
`LATE`, or `EXCUSED`.

**Event** — A dated calendar item: holiday, trip, parent meeting, activity. Targetable at the whole
school, roles, or specific classes.

**Announcement** — A written message published to an audience. Draftable, schedulable, targetable.
Announcements plus notifications are the entire V1 communication surface.

**Notification** — A per-user, in-app alert with read/unread state, deep-linking to a resource.
Stored as a **translation key plus parameters**, never as rendered text, so it renders correctly in
either language.

**File Asset** — Metadata for a file stored in Cloudinary. The database holds the record; Cloudinary
holds the bytes. Counts against the organization's storage limit.

**Audit Log** — An insert-only record of a sensitive action: who, which organization, what, when,
which resource, what changed, and why. Never updated, never deleted.

**Document Chunk** — A slice of unstructured text plus its pgvector embedding, used for RAG. Carries
`organizationId` so retrieval can filter by tenant *before* the similarity search.

**Plan** — A platform-level subscription tier with limits (`maxStudents`, `maxTeachers`,
`storageMb`, `aiRequestsPerMonth`). Not tenant-scoped.

**Subscription** — An organization's link to a plan, with a status and billing period. Carries
nullable provider fields so a payment processor can be connected later.

**Usage Counter** — A tracked metric for one organization in one period, incremented in the same
transaction as the action it measures.

---

## Naming conventions

| Context | Convention | Example |
|---|---|---|
| Prisma models | `PascalCase`, singular | `AttendanceSession` |
| Prisma fields | `camelCase` | `classSubjectId` |
| Enums | `PascalCase` name, `SCREAMING_SNAKE` values | `AttendanceStatus.PRESENT` |
| API paths | `kebab-case`, plural | `/api/v1/attendance-sessions` |
| Frontend features | `kebab-case` folder | `features/attendance/` |
| AI tool names | `camelCase` verb-first | `getAttendanceSummary` |
| Booleans | `is` / `has` / `allow` prefix | `isCorrect`, `allowLateSubmission` |
| Timestamps | `-At` suffix, always UTC | `publishedAt`, `archivedAt` |

## Bilingual fields

User-visible names stored in the database carry an optional Arabic counterpart with the `Ar`
suffix: `name` / `nameAr`, `title` / `titleAr`. UI chrome is translated through the i18n layer
instead — only *data* gets a second column.
