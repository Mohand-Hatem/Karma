# Karma — Project Roadmap, Phases 1–7

> **For agentic workers:** This document is **task-level, not step-level.** Each task below names its files, its interfaces, and its done-condition — enough to scope and sequence work correctly — but does not expand into 2–5-minute TDD steps with inline code, the way [`2026-09-02-phase-0-foundation.md`](./2026-09-02-phase-0-foundation.md) does.
>
> **Before starting any phase below, re-run `writing-plans` to expand that phase into a full step-by-step plan**, using the actual file paths, function names, and schema state left behind by the phases before it. Planning all 7 remaining phases to Phase-0 depth today would mean writing several hundred TDD steps against assumptions — exact Prisma field names, exact service signatures — that Phase 0 and Phase 1 will inevitably adjust once real code exists. A stale 250-step plan is worse than a fresh 20-step one written when it's actually needed.
>
> This document's job is different: give you the **shape of the whole project** — what depends on what, in what order — so scope is visible today even though step-by-step detail is deferred.

**Spec:** [docs/PROJECT_BLUEPRINT.md](../../PROJECT_BLUEPRINT.md) · [docs/DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) · [docs/ERD.md](../../ERD.md) · [docs/AUTHORIZATION_MATRIX.md](../../AUTHORIZATION_MATRIX.md) · [docs/TECH_STACK.md](../../TECH_STACK.md) · [docs/ENVIRONMENT_REFERENCE.md](../../ENVIRONMENT_REFERENCE.md) · [docs/GLOSSARY.md](../../GLOSSARY.md)

## Global Constraints

Identical to Phase 0's — they don't change per phase:

- npm workspaces only. Node.js 22 LTS. TypeScript strict everywhere.
- Every domain table carries `organizationId`; every query goes through `prisma` from `apps/api/src/db/prisma.ts`, never `rawPrisma`, outside seed scripts and platform-level `Plan` reads.
- Every new Zod schema is written once in `packages/shared` and consumed by both apps.
- Every new endpoint gets a row in `docs/AUTHORIZATION_MATRIX.md` **before** it is built, and a corresponding case in the authorization test harness (Phase 1).
- Every module follows the layering from blueprint §6.3: `controller.ts` → `service.ts` → `repository.ts`, never skipping a layer.
- CSS: logical properties only. Every screen reviewed in both `en` (LTR) and `ar` (RTL) before being marked done.
- CI must stay green after every task — no task is complete with a red pipeline.

---

## Phase 1 — The Vertical Slice

**Goal:** Ship blueprint §1's example workflow end to end, live: admin creates class → assigns teacher → enrolls student → teacher posts lesson and assignment → student submits → teacher grades → result is published → parent sees it. This is the phase that proves every architectural bet from Phase 0 under a real feature.

**Depends on:** Phase 0 complete (tenant extension, Better Auth, CI, deployment all working).

### Task 1.1 — Domain profiles: Student, Teacher, Parent, ParentStudent

**Files:** `apps/api/prisma/schema.prisma` (add models per DATABASE_SCHEMA.md §5) · `apps/api/src/modules/students/` · `apps/api/src/modules/teachers/` · `apps/api/src/modules/parents/` (each: `repository.ts`, `service.ts`, `controller.ts`, `routes.ts`, `mapper.ts`) · `packages/shared/src/schemas/{student,teacher,parent}.ts`

**Interfaces:** `createStudent(input): Promise<Student>` (enforces `maxStudents` via Phase 0's `enforceLimit`, increments `STUDENTS` usage in the same transaction) · equivalent for teacher/parent · `linkParentToStudent(parentId, studentId, relationship): Promise<ParentStudent>` (admin-only).

**Done when:** CRUD + archive works for all three profiles through the API, each create path is limit-enforced and transactional with its usage increment, and `ParentStudent` links are creatable only by an admin (matches AUTHORIZATION_MATRIX.md §5).

### Task 1.2 — Academic structure: AcademicYear, Term, Class, Subject, ClassSubject, TeacherSubject, StudentEnrollment

**Files:** `apps/api/prisma/schema.prisma` (DATABASE_SCHEMA.md §6) · `apps/api/src/modules/academic-years/` · `apps/api/src/modules/classes/` · `apps/api/src/modules/subjects/`

**Interfaces:** `activateAcademicYear(id)` (enforces exactly-one-active, per §1 of DATABASE_SCHEMA.md) · `assignTeacherToClassSubject(classId, subjectId, teacherId)` (validates a matching `TeacherSubject` exists first — this is the qualification-then-assignment rule from GLOSSARY.md) · `enrollStudent(studentId, classId)` (writes the partial-unique-index-backed `StudentEnrollment`, requires the hand-written migration from DATABASE_SCHEMA.md §1 constraint 3).

**Done when:** the "exactly one active academic year per organization" and "one active enrollment per student per year" rules are proven by test, and `ClassSubject` cannot be created without a prior matching `TeacherSubject`.

### Task 1.3 — Lessons and Assignments

**Files:** `apps/api/src/modules/lessons/` · `apps/api/src/modules/assignments/` · frontend: `apps/web/src/features/lessons/` · `apps/web/src/features/assignments/`

**Interfaces:** `publishLesson(id)` (students see `PUBLISHED` only) · `createAssignment(input)` → `Draft` · `publishAssignment(id)` → `Published`, audited · resource attachment via `FileAsset` (Task 1.6 must land first, or this task stubs attachment and revisits).

**Done when:** a teacher can draft, publish, and see their own drafts; a student sees only published items scoped to their enrollment (AUTHORIZATION_MATRIX.md §7).

### Task 1.4 — Submissions and grading

**Files:** `apps/api/src/modules/assignments/submission-service.ts` · frontend: `apps/web/src/features/assignments/submission-drawer.tsx`

**Interfaces:** `submitAssignment(assignmentId, studentId, content)` — computes `LATE` vs `SUBMITTED` by comparing `submittedAt` to `dueAt` in the organization's timezone (ENVIRONMENT_REFERENCE.md §3, `OrganizationSettings.timezone`) · `gradeSubmission(submissionId, score, feedback)` — teacher/`ASSIGNED` scope only.

**Done when:** the late-window classification test passes for a submission on either side of `dueAt`/`lateUntil`, and a student cannot read or grade another student's submission (priority case #1 in AUTHORIZATION_MATRIX.md §15).

### Task 1.5 — Grading scheme and result publication

**Files:** `apps/api/src/modules/results/` (grading-scheme-service.ts, result-service.ts) · frontend: `apps/web/src/features/results/`

**Interfaces:** `createGradingScheme(classSubjectId, categories)` — rejects unless weights sum to 100 · `computeResultPreview(studentId, classSubjectId, termId)` — teacher-only, unpublished · `publishResult(...)` — writes the frozen `Result` row with `breakdown` JSON inside one transaction, per DATABASE_SCHEMA.md §9 · `correctResult(resultId, reason)` — inserts `version + 1`, sets `supersededAt` on the prior row, requires `reason`, writes an `AuditLog` entry.

**Done when:** publishing is atomic (score + breakdown written together), a published `Result` has no update path in the repository (only insert-new-version), and a parent sees the latest version plus a correction notice when one exists.

### Task 1.6 — File uploads (Multer → Cloudinary → FileAsset)

**Files:** `apps/api/src/modules/files/` · uses `file-type` for magic-byte MIME validation (TECH_STACK.md §3)

**Interfaces:** `uploadFile(buffer, context, uploaderId)` — validates type and size, checks `storageMb` via `enforceLimit`, uploads to Cloudinary, writes `FileAsset` and increments `STORAGE_MB` usage in one transaction · `getFileDownloadUrl(fileAssetId, requestingUserId)` — authorization-checked, never a raw Cloudinary URL for restricted files.

**Done when:** an oversized or wrong-type upload is rejected before reaching Cloudinary, and downloading a file the caller isn't authorized for returns 404.

### Task 1.7 — Frontend: auth pages, dashboard shell, drawers

**Files:** `apps/web/src/app/[locale]/(auth)/` (login, accept-invitation, forgot-password, reset-password) · `apps/web/src/app/[locale]/(dashboard)/layout.tsx` (sidebar, using the Zustand shell store from Phase 0 Task 13) · `apps/web/src/components/ui/` (Button, Input, Drawer, Table, etc. — the Radix-based primitives from TECH_STACK.md §2)

**Interfaces:** consumes `authClient` from Phase 0 Task 15 · role-aware nav per blueprint §13, built from the session's `member.role`.

**Done when:** all four demo roles can log in and see a role-appropriate sidebar with no items that 403 when clicked (blueprint §13 rule).

### Task 1.8 — Invitations and demo login

**Files:** `apps/api/src/modules/invitations/` (thin wrapper over Better Auth's organization plugin invitation API) · `apps/web/src/app/[locale]/(auth)/accept-invitation/`

**Interfaces:** `inviteUser(email, role)` — admin-only, checks `maxTeachers`/nothing for students (students are created directly, not invited, per blueprint §4.2 vs profiles distinction — **confirm this distinction explicitly when expanding this task**, since the blueprint's invite flow was written before profiles existed as separate from `member`) · demo login gated by `ENABLE_DEMO_LOGIN`.

**Done when:** an invited email can accept, set a password, and land in onboarding; `ENABLE_DEMO_LOGIN=false` makes the demo route return 404, not just hide the button.

### Task 1.9 — Authorization matrix test harness

**Files:** `apps/api/src/test/authz-matrix.ts` (fixture builder: seeds two organizations, four roles each, one of each resource type) · `apps/api/src/test/authz-matrix.test.ts` (data-driven from `docs/AUTHORIZATION_MATRIX.md`'s tables)

**Interfaces:** consumes every service built in Tasks 1.1–1.6. Produces the reusable two-organization fixture every later phase's authorization tests extend.

**Done when:** all ten priority cases from AUTHORIZATION_MATRIX.md §15 pass, plus a generated case per row in §5–§9's tables for the entities that exist by end of Phase 1.

### Task 1.10 — Seed data + E2E happy paths

**Files:** extend `apps/api/src/seed.ts` from Phase 0 · `apps/web/e2e/vertical-slice.spec.ts` (Playwright)

**Interfaces:** seeds one full class, one teacher, several students, one parent link, one lesson, one assignment with submissions, one published result.

**Done when:** the 5 Playwright happy paths from blueprint §26.4 pass against the seeded data, in CI.

**Phase 1 exit criterion:** a reviewer can log in as each of the four demo roles on the live deployment and click through the full blueprint §1 workflow.

---

## Phase 2 — Timetable & Attendance

**Depends on:** Phase 1's `ClassSubject` and `Student`/`Teacher` models.

### Task 2.1 — TimetableSlot with conflict validation

**Files:** `apps/api/src/modules/timetable/` (service includes `validateNoConflict(slot)` checking teacher, class, and room overlap by `dayOfWeek` + minute range, per DATABASE_SCHEMA.md §6)

**Done when:** creating an overlapping slot for the same teacher, class, or room is rejected with a specific conflict reason; the integer-minute overlap check is unit tested independent of the database.

### Task 2.2 — Weekly grid views

**Files:** `apps/web/src/features/timetable/` — three views (by class, by teacher, by student), all reading the same endpoint filtered server-side by scope.

**Done when:** a teacher sees only their own grid; a student sees only their class's grid (AUTHORIZATION_MATRIX.md §6).

### Task 2.3 — AttendanceSession + AttendanceEntry, bulk upsert

**Files:** `apps/api/src/modules/attendance/` — `takeAttendance(timetableSlotId, date, entries[])` as one transaction, `editableUntil` frozen at creation from `OrganizationSettings.attendanceEditWindowHours`.

**Done when:** the bulk upsert is atomic (partial failure test: one bad `studentId` in the batch rolls back the whole write), and an edit attempt after `editableUntil` is rejected for a teacher but allowed (and audited) for an admin.

### Task 2.4 — Teacher/student dashboards driven by real schedule data

**Files:** `apps/web/src/features/dashboard/teacher-dashboard.tsx`, `student-dashboard.tsx` — replace Phase 1's placeholder "today's lessons" with real `TimetableSlot` queries.

**Done when:** "today's lessons" and "sessions needing attendance" on the teacher dashboard reflect the actual day of week in the organization's timezone.

---

## Phase 3 — Assessment

**Depends on:** Phase 1's `GradeCategory`/`GradingScheme`, Phase 2's `ClassSubject` usage patterns.

### Task 3.1 — Quiz builder (questions, options)

**Files:** `apps/api/src/modules/quizzes/` — `QuizQuestion`, `QuizOption` CRUD, **immutable once any `QuizAttempt` exists** (checked in the service, not just documented).

**Interfaces:** two DTOs from one mapper — `toTeacherQuizDTO` (includes `isCorrect`) and `toStudentQuizDTO` (the type has no such field, not a stripped runtime value) — this split is the single highest-priority implementation detail in this phase, per AUTHORIZATION_MATRIX.md §8.

**Done when:** a test asserts the student DTO's TypeScript type has no `isCorrect` property (a compile-time check, not just a runtime assertion) — see `docs/superpowers/plans` convention: type consistency is checked, not just behavior.

### Task 3.2 — Quiz attempt state machine

**Files:** `apps/api/src/modules/quizzes/attempt-service.ts` — `startAttempt` (sets server-computed `expiresAt`), `answerQuestion` (rejected once `now > expiresAt` or `status != IN_PROGRESS`), `submitAttempt` (auto-grades, freezes answers).

**Done when:** `unique(quizId, studentId)` is proven to block a second attempt at the database level (not just the service level — the test attempts to bypass the service and hit Prisma directly to confirm the constraint holds).

### Task 3.3 — Offline exams and marks

**Files:** `apps/api/src/modules/exams/`

**Done when:** exam marks feed the same `GradeCategory` pipeline as assignments and quizzes (Task 3.4 depends on this).

### Task 3.4 — Weighted term computation, wired to publication from Phase 1

**Files:** extends `apps/api/src/modules/results/result-service.ts` from Phase 1 Task 1.5 — the compute step now pulls from three sources (`AssignmentSubmission`, `QuizAttempt`, `ExamMark`) grouped by category.

**Done when:** a term with all three graded-item types produces a `Result.breakdown` that sums correctly to `Result.score`, verified by a test with hand-computed expected values.

### Task 3.5 — Results dashboards

**Files:** `apps/web/src/features/results/` — trend view across terms.

**Done when:** a student/parent sees their own trend; a teacher sees class-level distribution for their `ClassSubject` only (no school-wide leak, per AUTHORIZATION_MATRIX.md §12).

---

## Phase 4 — Communication

**Depends on:** Phase 1's `Class`/role model.

### Task 4.1 — Events and Announcements with targeting

**Files:** `apps/api/src/modules/events/`, `apps/api/src/modules/announcements/` — shared targeting pattern (`audienceType` discriminator + `Role[]` + class join table, per DATABASE_SCHEMA.md §11).

**Done when:** an announcement targeted at one class is invisible to a student in a different class, and a draft is invisible to everyone but its author and admins.

### Task 4.2 — Domain event bus

**Files:** `apps/api/src/events/emitter.ts`, `apps/api/src/events/handlers/notification-handler.ts`

**Interfaces:** `emit('assignment.published', payload)` / `emit('result.published', payload)` — an in-process `EventEmitter`, not a queue. Handlers resolve recipients and write `Notification` rows with translation keys, not rendered text (DATABASE_SCHEMA.md §11).

**Done when:** publishing a result triggers a `Notification` row for the student and each linked parent, with `titleKey`/`params` — and switching the recipient's locale after the fact still renders correctly (this is the point of storing keys, not text — a test should prove it).

### Task 4.3 — Firebase Realtime delivery signal

**Files:** `apps/api/src/modules/notifications/firebase-signal.ts` — mints a Firebase custom token from the Better Auth session, writes `{unreadCount, updatedAt}` to `/notifications/{userId}` after each `Notification` insert. `apps/web/src/features/notifications/use-notification-signal.ts` — subscribes and invalidates the TanStack Query key for the notification list.

**Done when:** Firebase holds no notification content, only a count and timestamp (verified by inspecting what's actually written); Firebase security rules (committed to the repo) restrict each UID to its own path.

---

## Phase 5 — Analytics & Reports

**Depends on:** Phase 2 (attendance), Phase 3 (results) having real data to aggregate.

### Task 5.1 — SQL-based analytics queries

**Files:** `apps/api/src/modules/analytics/` — every aggregate written as a Prisma `groupBy` or, where grouping needs go beyond Prisma's capability, a raw query using the **`tenantQueryRaw` helper** decided as an open item in the architecture audit (this helper does not exist yet — creating it is this task's first sub-step, since analytics is the first module that needs raw SQL and therefore the first to hit the gap where the Prisma extension does not cover `$queryRaw`).

**Interfaces:** `tenantQueryRaw<T>(sql: Prisma.Sql): Promise<T>` — wraps `prisma.$queryRaw`, asserts the query string contains an `organizationId = $N` predicate (a lint-time or runtime guard — decide which when this task is expanded), reads the org id from `getCurrentOrganizationId()`.

**Done when:** a two-organization isolation test (reusing Phase 1 Task 1.9's fixture) proves every analytics endpoint returns zero cross-tenant rows, including the raw-SQL ones.

### Task 5.2 — Role-scoped analytics dashboards

**Files:** `apps/web/src/features/analytics/`

**Done when:** a teacher's dashboard aggregates only their `ASSIGNED` class-subjects — computed with that scope inside the SQL, not filtered client-side after a broader fetch (AUTHORIZATION_MATRIX.md §12 explicit warning).

### Task 5.3 — Reports module + CSV export

**Files:** `apps/api/src/modules/reports/`

**Done when:** CSV export is audited (per blueprint §12 UI component list — "Export" is a matrix action) and respects the same scope rules as analytics.

### Task 5.4 — Organization & Plan screen

**Files:** `apps/web/src/features/organization/` — read-only usage meters against `UsageCounter`/`Plan` from Phase 0.

**Done when:** the usage bars reflect real counter values, admin-only, no billing UI attached (blueprint §2 non-goal).

---

## Phase 6 — EduAI

**Depends on:** every service module existing (tools wrap them) and Phase 5's analytics queries (tools reuse the same aggregation logic rather than duplicating it).

### Task 6.1 — Tool layer over the service layer

**Files:** `apps/api/src/modules/ai/tools/` — one file per tool (`getAttendanceSummary.ts`, `getStudentGrades.ts`, …), each a thin wrapper calling an existing service function with the caller's real `getCurrentOrganizationId()` and role scope. No tool accepts a user or organization ID as a free parameter (AUTHORIZATION_MATRIX.md §12 explicit rule).

**Done when:** a test proves a student's tool call for another student's grades returns nothing, using the exact same authorization matrix fixture Task 1.9 built — proving there is no second authorization path to keep in sync.

### Task 6.2 — Redis + BullMQ (first introduction in the whole project)

**Files:** `apps/api/src/queue/` — connection setup, `document-processing` queue and worker.

**Interfaces:** `queueDocumentForEmbedding(fileAssetId)` — enqueued from Task 1.6's upload flow once this phase lands; idempotent job, retries on failure.

**Done when:** re-running a completed job is a safe no-op (idempotency test), and jobs establish tenant context explicitly at the start of processing (DATABASE_SCHEMA.md §6.5 rule — jobs run outside a request, so `runWithOrganization` must be called manually with the job's stored `organizationId`).

### Task 6.3 — Embeddings and DocumentChunk

**Files:** `apps/api/src/modules/ai/embeddings.ts` — chunking + embedding generation, run inside Task 6.2's worker. `apps/api/src/modules/ai/document-chunk-repository.ts` — the hand-written repository using `$queryRaw` for the `vector` column (Prisma's `Unsupported` type constraint from DATABASE_SCHEMA.md §12).

**Interfaces:** `searchDocumentChunks(organizationId, embedding, limit)` — **must use the Phase 5 `tenantQueryRaw` helper**, applying the `organizationId` filter *before* the similarity search, per the contradiction flagged in the architecture audit. This is the single most security-sensitive query in the codebase.

**Done when:** the two-organization RAG isolation test (priority case #10 in AUTHORIZATION_MATRIX.md §15) passes — organization B's chunks never appear in organization A's search results, proven against real pgvector, not mocked.

### Task 6.4 — Chat UI with streaming

**Files:** `apps/api/src/modules/ai/chat-controller.ts` (chunked HTTP response) · `apps/web/src/features/ai/chat.tsx` (`fetch` + `ReadableStream`, per blueprint §4.21 — not Socket.IO, not SSE)

**Interfaces:** `AIConversation`/`AIMessage` persistence per user, per Phase 0's `DocumentChunk` and this phase's tool layer.

**Done when:** a conversation survives a page refresh (persisted), and every number in a sample answer traces back to a tool result in the message's `toolCalls` log — not a value the model could have computed itself.

### Task 6.5 — Rate limits, usage counters, golden eval set

**Files:** `apps/api/src/modules/ai/rate-limit.ts` (per-user hourly limit, per ENVIRONMENT_REFERENCE.md §7) · every AI request increments `UsageCounter` metric `AI_REQUESTS`, enforced via Phase 0's `enforceLimit` · `apps/api/src/modules/ai/eval/golden-set.ts` (~10 `question → expected tool call` cases) · `apps/api/src/modules/ai/eval/golden-set.test.ts`, run in CI.

**Done when:** exceeding the plan's `aiRequestsPerMonth` returns a clear `LIMIT_EXCEEDED` response before the LLM is called (no wasted spend), and the golden set passes in CI.

---

## Phase 7 — Hardening

**Depends on:** everything above existing.

### Task 7.1 — Security review against blueprint §22

**Files:** none new — an audit pass. Produces a checklist of findings, each either fixed inline or filed as a follow-up task.

**Done when:** every bullet in blueprint §22 has a verified checkmark, including the raw-query tenant-filter rule from Phase 5/6.

### Task 7.2 — Query optimization

**Files:** none new — `EXPLAIN ANALYZE` against the seeded (or a larger synthetic) dataset for the top 10 slowest known queries (list dashboards, analytics, RAG search).

**Done when:** each optimization is documented with a before/after `EXPLAIN` in the PR description, per blueprint §25.

### Task 7.3 — Sentry / error monitoring

**Files:** `apps/api/src/config/sentry.ts`, `apps/web/sentry.client.config.ts`

**Done when:** a deliberately thrown test error appears in the Sentry dashboard from both apps.

### Task 7.4 — Accessibility pass, LTR and RTL

**Files:** none new — `@axe-core/playwright` run across the Phase 1 E2E suite in both locales.

**Done when:** zero critical/serious axe violations in either direction.

### Task 7.5 — Full seed/demo environment with scheduled reset

**Files:** extends `apps/api/src/seed.ts` across every phase's data (per blueprint §27's full requirements list) · a scheduled job or host-level cron to reset the demo database.

**Done when:** the demo resets on schedule without manual intervention, and reset data matches blueprint §27's bilingual, multi-term, believable-attendance requirements.

### Task 7.6 — README with architecture diagram, ERD, screenshots, decisions log

**Files:** `README.md`

**Done when:** it stands alone as the artifact a reviewer opens first — links to the live demo, the architecture diagram, and this docs folder.

---

## Dependency summary

```text
Phase 0 (done once) ─┬─► Phase 1 (vertical slice) ─┬─► Phase 2 (timetable/attendance)
                      │                              ├─► Phase 3 (assessment) ──┐
                      │                              └─► Phase 4 (communication)│
                      │                                                          ▼
                      │                              Phase 5 (analytics) ◄───────┘
                      │                                        │
                      │                                        ▼
                      └───────────────────────────────► Phase 6 (EduAI)
                                                                │
                                                                ▼
                                                         Phase 7 (hardening)
```

Phases 2, 3, and 4 are independent of each other and could run in parallel workstreams once Phase 1 is done, if more than one implementer is available. Phase 5 needs real data from at least Phase 2 or 3 to be meaningfully testable. Phase 6 needs the full service surface, so it is last before hardening by design.
