# Karma — Database Schema

> PostgreSQL + Prisma + pgvector. Multi-tenant, `organizationId` on every domain table.
> Terminology follows [GLOSSARY.md](./GLOSSARY.md). Diagram in [ERD.md](./ERD.md).
>
> **Status: design, not yet implemented.** No migration exists.

---

## 1. Conventions

| Concern | Decision |
|---|---|
| Primary keys | `String @id @default(cuid())` — sortable-enough, URL-safe, no sequence leakage |
| Timestamps | `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, **always UTC** |
| Money/scores | `Decimal @db.Decimal(6,2)` — never `Float`. Scores and weights must not drift |
| Time-of-day | `Int` minutes from midnight (`startMinute`), **not** `DateTime`. A weekly period has no date, so it must not carry a timezone |
| Dates without time | `DateTime @db.Date` |
| Tenant column | `organizationId String` + relation on every domain model. Injected by the Prisma extension, never accepted from a client |
| Bilingual data | Optional `Ar`-suffixed sibling column on user-visible names |
| Enum values | `SCREAMING_SNAKE_CASE` |

### Delete strategy

| Class | Behavior | Examples |
|---|---|---|
| **Archive** | `status` moves to an archived value, `archivedAt` set. Rows are never removed | Student, Teacher, Parent, Class, Subject, AcademicYear |
| **Soft delete** | `deletedAt` set; Cloudinary asset removed separately | FileAsset |
| **Cascade** | Child rows owned entirely by a parent | QuizOption ← QuizQuestion, AttendanceEntry ← AttendanceSession, LessonResource ← Lesson |
| **Restrict** | Deletion blocked while history references it | Subject ← ClassSubject, Student ← Result |
| **Append-only** | Insert-only; never updated or deleted | Result (versioned), AuditLog |

### Immutable entities

- **`Result`** — corrections insert a new `version` and set `supersededAt` on the prior row.
- **`AuditLog`** — insert-only. No `updatedAt` column exists, deliberately.
- **`QuizAnswer`** — writable only while the parent attempt is `IN_PROGRESS`; frozen on submit.

### Constraints that PostgreSQL cannot express

Documented here so they are not forgotten in the service layer:

1. **Exactly one `ACTIVE` academic year per organization** — application-enforced in a transaction.
2. **Grade category weights sum to 100 per scheme** — a cross-row invariant; enforced in the
   service, since a `CHECK` cannot span rows.
3. **One active enrollment per student per academic year** — enforceable as a *partial* unique index
   via raw SQL in a migration:
   `CREATE UNIQUE INDEX ... ON "StudentEnrollment"("studentId","academicYearId") WHERE status = 'ACTIVE';`
   Prisma cannot express this in the schema, so it ships as a hand-written migration step.
4. **No overlapping timetable slots** for a teacher, class, or room — application-validated.
   Optional hardening: a Postgres `EXCLUDE USING gist` constraint with `btree_gist`, added by raw
   SQL. Not in MVP.
5. **Exactly one `ACTIVE` subscription per organization** — application-enforced.

---

## 2. Better Auth-owned tables

Generated and managed by Better Auth (core + organization plugin). **Do not hand-edit beyond
additive fields.** Listed for completeness only.

| Model | Key fields | Notes |
|---|---|---|
| `user` | `id`, `name`, `email` (unique), `emailVerified`, `image`, timestamps | Identity only. No domain fields. |
| `session` | `id`, `token` (unique), `userId`, `expiresAt`, `ipAddress`, `userAgent`, `activeOrganizationId` | Cookie session. `activeOrganizationId` added by the org plugin. |
| `account` | `id`, `userId`, `providerId`, `password` (hashed), token fields | Password hash lives here, managed by the library. |
| `verification` | `id`, `identifier`, `value`, `expiresAt` | Email verification and password reset tokens. |
| `organization` | `id`, `name`, `slug` (unique), `logo`, `metadata`, `createdAt` | **The tenant root.** |
| `member` | `id`, `organizationId`, `userId`, `role`, `createdAt` | User ↔ organization join, carrying the Karma role. Unique on (`organizationId`, `userId`). |
| `invitation` | `id`, `organizationId`, `email`, `role`, `status`, `expiresAt`, `inviterId` | Invite-only onboarding. |

**Role values** are configured as Better Auth custom roles, not the plugin defaults:
`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`.

**There is no `Admin` profile model.** An admin is a `user` with a `member.role` of `ADMIN`. Only
Student, Teacher, and Parent need domain profiles.

---

## 3. Organization configuration

### `OrganizationSettings`

One row per organization (1:1).

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | cuid |
| `organizationId` | String | ✓ | **`@unique`** → 1:1 with `organization` |
| `timezone` | String | ✓ | IANA, e.g. `Africa/Cairo`. All date-only comparisons resolve against this |
| `defaultLocale` | `Locale` | ✓ | `EN` \| `AR` |
| `weekStartDay` | `DayOfWeek` | ✓ | `SUNDAY` for most Arabic-region schools |
| `attendanceEditWindowHours` | Int | ✓ | Default 24. Copied onto each session at creation |
| `gradingDefaults` | Json | – | Default category weights for new schemes |
| `createdAt` / `updatedAt` | DateTime | ✓ | |

---

## 4. SaaS: plans, subscriptions, usage

### `Plan` — platform-level, **not** tenant-scoped

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `code` | String | ✓ | `@unique` — e.g. `FREE`, `SCHOOL`, `DISTRICT` |
| `name` / `nameAr` | String | ✓ / – | |
| `maxStudents` | Int | ✓ | |
| `maxTeachers` | Int | ✓ | |
| `storageMb` | Int | ✓ | |
| `aiRequestsPerMonth` | Int | ✓ | |
| `isActive` | Boolean | ✓ | Default `true` |
| `sortOrder` | Int | ✓ | |

> Exempt from the tenant extension — plans are shared across all organizations.

### `Subscription`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | → `organization`, `onDelete: Cascade` |
| `planId` | String | ✓ | → `Plan`, `onDelete: Restrict` |
| `status` | `SubscriptionStatus` | ✓ | `TRIALING` \| `ACTIVE` \| `PAST_DUE` \| `CANCELED` \| `EXPIRED` |
| `currentPeriodStart` | DateTime | ✓ | |
| `currentPeriodEnd` | DateTime | ✓ | |
| `canceledAt` | DateTime | – | |
| `provider` | String | – | **Null in MVP.** `stripe`, `paymob`, … |
| `externalCustomerId` | String | – | **Null in MVP** |
| `externalSubscriptionId` | String | – | **Null in MVP** |

Indexes: `@@index([organizationId, status])`.
History is kept — rows are never deleted. One `ACTIVE` row per organization, application-enforced.

The three nullable provider columns exist so connecting a payment processor later is a code change,
not a migration. **No payment, checkout, or billing logic is in scope.**

### `UsageCounter`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | |
| `metric` | `UsageMetric` | ✓ | `STUDENTS` \| `TEACHERS` \| `STORAGE_MB` \| `AI_REQUESTS` |
| `period` | String | ✓ | `"current"` for level metrics; `"YYYY-MM"` for rate metrics |
| `value` | Int | ✓ | |
| `updatedAt` | DateTime | ✓ | |

`@@unique([organizationId, metric, period])`

**Level metrics** (`STUDENTS`, `TEACHERS`, `STORAGE_MB`) use `period = "current"` and move up and
down. **Rate metrics** (`AI_REQUESTS`) use `period = "2026-09"` and only increase. Every increment
happens in the **same transaction** as the action it measures, so the counter cannot drift.

---

## 5. Profiles

All three share the same shape: a 1:1 link to a Better Auth `user`, an org-scoped human-readable
code, bilingual names, and archival status.

### `Student`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | |
| `userId` | String | ✓ | `@unique` → `user`, `onDelete: Restrict` |
| `studentCode` | String | ✓ | Human-facing ID |
| `firstName` / `lastName` | String | ✓ | |
| `firstNameAr` / `lastNameAr` | String | – | |
| `dateOfBirth` | DateTime `@db.Date` | ✓ | |
| `gender` | `Gender` | – | |
| `phone` / `address` | String | – | |
| `avatarFileId` | String | – | → `FileAsset`, `onDelete: SetNull` |
| `admissionDate` | DateTime `@db.Date` | ✓ | |
| `status` | `ProfileStatus` | ✓ | `ACTIVE` \| `INACTIVE` \| `GRADUATED` \| `TRANSFERRED` \| `ARCHIVED` |
| `archivedAt` | DateTime | – | |

`@@unique([organizationId, studentCode])` · `@@index([organizationId, status])`

### `Teacher`

Same shape, plus `employeeCode` (`@@unique([organizationId, employeeCode])`), `specialization`,
`hireDate`. Status enum shared.

### `Parent`

Same shape, plus `occupation`. No code field — parents are reached through their children.

### `ParentStudent` — many-to-many link

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | |
| `parentId` | String | ✓ | → `Parent`, `onDelete: Cascade` |
| `studentId` | String | ✓ | → `Student`, `onDelete: Cascade` |
| `relationship` | `Relationship` | ✓ | `FATHER` \| `MOTHER` \| `GUARDIAN` \| `OTHER` |
| `isPrimaryContact` | Boolean | ✓ | Default `false` |

`@@unique([parentId, studentId])` — **this row is the entire basis of parent authorization.** Every
parent-scoped query joins through it.

---

## 6. Academic structure

### `AcademicYear`

`id`, `organizationId`, `name` ("2025/2026"), `startDate`, `endDate`, `status`
(`UPCOMING` \| `ACTIVE` \| `CLOSED`), timestamps.

`@@unique([organizationId, name])` · `@@index([organizationId, status])`

### `Term`

`id`, `organizationId`, `academicYearId` (→ `AcademicYear`, `Cascade`), `name`, `nameAr`,
`order` Int, `startDate`, `endDate`, timestamps.

`@@unique([academicYearId, order])` · `@@unique([academicYearId, name])`

Date ranges must not overlap within a year — service-enforced.

### `Class`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | |
| `academicYearId` | String | ✓ | → `AcademicYear`, `onDelete: Restrict` |
| `name` / `nameAr` | String | ✓ / – | "10A" |
| `gradeLevel` | Int | ✓ | 1–12 |
| `section` | String | – | "A" |
| `homeroomTeacherId` | String | – | → `Teacher`, `onDelete: SetNull` |
| `capacity` | Int | – | |
| `status` | `ProfileStatus` | ✓ | |

`@@unique([organizationId, academicYearId, name])` · `@@index([organizationId, academicYearId])`

> **Decision: a class is year-scoped.** "10A" in 2025/26 and "10A" in 2026/27 are different rows.
> This makes enrollments, timetables, and results naturally year-bounded without a year column on
> each of them, and makes historical reporting correct by construction.

### `Subject`

`id`, `organizationId`, `code`, `name`, `nameAr`, `description`, `status`, timestamps.

`@@unique([organizationId, code])`

> **Not** year-scoped. Mathematics persists across years.

### `ClassSubject` — the spine

*This class studies this subject, taught by this teacher.*

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | **Surrogate PK** |
| `organizationId` | String | ✓ | |
| `classId` | String | ✓ | → `Class`, `onDelete: Cascade` |
| `subjectId` | String | ✓ | → `Subject`, `onDelete: Restrict` |
| `teacherId` | String | ✓ | → `Teacher`, `onDelete: Restrict` |

`@@unique([classId, subjectId])` · `@@index([organizationId, teacherId])`

**Answering "what is the correct key structure for ClassSubject?"** — a **surrogate `id` primary key
with a composite unique on (`classId`, `subjectId`)**. Not a composite primary key. The reason is
that `ClassSubject` is referenced as a foreign key by `TimetableSlot`, `Lesson`, `Assignment`,
`Quiz`, `Exam`, `GradingScheme`, and `AttendanceSession`; propagating a two-column key into seven
tables would be miserable to write and slower to index.

**This is the central modeling decision of the schema.** Everything taught hangs off a
`ClassSubject`, never off a loose `classId` + `subjectId` pair. It makes an invalid pairing
unrepresentable, and it means `teacherId` — and therefore "is this teacher allowed to touch this?" —
is one join away from every academic record.

`@@index([organizationId, teacherId])` exists specifically to make teacher authorization checks fast.

### `TeacherSubject` — qualification, not assignment

`id`, `organizationId`, `teacherId`, `subjectId`, `createdAt`. `@@unique([teacherId, subjectId])`

**Answering "how does a teacher become associated with a subject/class?"** — in two distinct steps:

1. **Qualification** — `TeacherSubject` records that a teacher *can* teach a subject.
2. **Assignment** — `ClassSubject.teacherId` records that they *do* teach it, to a specific class.

Creating a `ClassSubject` validates that the matching `TeacherSubject` exists. Keeping these
separate is what lets an admin see "who could cover Physics for 10B?" without inventing a query.

### `StudentEnrollment`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | |
| `studentId` | String | ✓ | → `Student`, `onDelete: Restrict` |
| `classId` | String | ✓ | → `Class`, `onDelete: Restrict` |
| `academicYearId` | String | ✓ | **Denormalized** from `Class` — see below |
| `enrolledAt` | DateTime | ✓ | |
| `leftAt` | DateTime | – | |
| `status` | `EnrollmentStatus` | ✓ | `ACTIVE` \| `TRANSFERRED` \| `WITHDRAWN` \| `COMPLETED` |

`@@unique([studentId, classId, academicYearId])` · `@@index([organizationId, classId, status])`

> **Justified denormalization.** `academicYearId` is derivable from `Class`, which normally means it
> should not be stored (§7 rule 5 of the blueprint). It is stored anyway because it buys a
> database-level business rule that is otherwise inexpressible: the partial unique index
> `WHERE status = 'ACTIVE'` guarantees a student cannot be actively enrolled in two classes in the
> same year. A rule the database enforces is worth one redundant column.

Mid-year transfer: set the old row to `TRANSFERRED` with `leftAt`, insert a new `ACTIVE` row. History
is preserved, and results from the first class remain attached to it.

### `TimetableSlot`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | String | ✓ | |
| `organizationId` | String | ✓ | |
| `classSubjectId` | String | ✓ | → `ClassSubject`, `onDelete: Cascade` |
| `dayOfWeek` | `DayOfWeek` | ✓ | `SUNDAY` … `SATURDAY` |
| `startMinute` | Int | ✓ | Minutes from midnight, e.g. `510` = 08:30 |
| `endMinute` | Int | ✓ | |
| `room` | String | – | |

`@@index([organizationId, classSubjectId])` · `@@index([organizationId, dayOfWeek])`

> **Why `Int` minutes and not `DateTime`.** A weekly recurring period has no date. Storing it as a
> `DateTime` forces an arbitrary date and drags UTC conversion into a value that has no timezone
> meaning — the classic source of "the timetable shifts by an hour in summer" bugs. Integers make
> overlap detection a trivial comparison.

Conflict validation (teacher / class / room double-booking) is service-level; see §1.

---

## 7. Learning

### `Lesson`

`id`, `organizationId`, `classSubjectId` (→ `ClassSubject`, `Cascade`), `timetableSlotId` (nullable,
`SetNull`), `title`, `titleAr`, `description`, `content`, `scheduledAt`, `status`
(`DRAFT` \| `PUBLISHED`), `publishedAt`, `createdById`, timestamps.

`@@index([organizationId, classSubjectId, scheduledAt])`

Students see `PUBLISHED` lessons only.

### `LessonResource`

`id`, `organizationId`, `lessonId` (`Cascade`), `fileAssetId` (`Restrict`), `title`, `order`,
`createdAt`. `@@unique([lessonId, order])`

### `Assignment`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `classSubjectId` | String | ✓ | → `ClassSubject`, `Restrict` |
| `gradeCategoryId` | String | – | → `GradeCategory`, `SetNull`. Ungraded practice work is allowed |
| `title` / `titleAr` | String | ✓ / – | |
| `description` / `instructions` | String | – | |
| `maxScore` | Decimal(6,2) | ✓ | |
| `dueAt` | DateTime | ✓ | |
| `lateUntil` | DateTime | – | End of the late window |
| `allowLateSubmission` | Boolean | ✓ | Default `true` |
| `status` | `AssignmentStatus` | ✓ | `DRAFT` \| `PUBLISHED` \| `CLOSED` |
| `publishedAt` | DateTime | – | |
| `createdById` | String | ✓ | → `Teacher` |

`@@index([organizationId, classSubjectId, dueAt])`

`AssignmentResource(assignmentId, fileAssetId, order)` holds attachments.

### `AssignmentSubmission`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `assignmentId` | String | ✓ | → `Assignment`, `Cascade` |
| `studentId` | String | ✓ | → `Student`, `Restrict` |
| `content` | String | – | Free text response |
| `submittedAt` | DateTime | ✓ | |
| `attemptNumber` | Int | ✓ | Increments on resubmission |
| `status` | `SubmissionStatus` | ✓ | `SUBMITTED` \| `LATE` \| `GRADED` \| `RETURNED` |
| `score` | Decimal(6,2) | – | Null until graded |
| `feedback` | String | – | |
| `gradedAt` | DateTime | – | |
| `gradedById` | String | – | → `Teacher` |

`@@unique([assignmentId, studentId])` · `@@index([organizationId, status])`

One row per student per assignment. Resubmission overwrites content and bumps `attemptNumber` rather
than creating rows — assignment history at the attempt level is not a product requirement.
`SubmissionFile(submissionId, fileAssetId)` holds uploads.

`LATE` is set by the service at submission time by comparing `submittedAt` against `dueAt` in the
organization's timezone. It is not recomputed later.

---

## 8. Assessment

### `Quiz`

`id`, `organizationId`, `classSubjectId` (`Restrict`), `gradeCategoryId` (nullable, `SetNull`),
`title`, `titleAr`, `instructions`, `timeLimitMinutes` (nullable), `totalPoints` Decimal,
`availableFrom`, `availableUntil`, `status` (`DRAFT` \| `PUBLISHED` \| `CLOSED`), `publishedAt`,
`createdById`, timestamps.

> `totalPoints` is the sum of question points, **frozen at publish time**. This is the second
> sanctioned derived value (after `Result`): questions must not be editable once attempts exist, and
> freezing the total makes that guarantee visible in the data.

### `QuizQuestion`

`id`, `organizationId`, `quizId` (`Cascade`), `type` (`MULTIPLE_CHOICE` \| `TRUE_FALSE`), `text`,
`textAr`, `points` Decimal, `order` Int. `@@unique([quizId, order])`

### `QuizOption`

`id`, `organizationId`, `questionId` (`Cascade`), `text`, `textAr`, `isCorrect` Boolean, `order` Int.
`@@unique([questionId, order])`

> **`isCorrect` is the answer key.** The student-facing DTO must not contain this field — not set to
> `false`, not omitted at runtime: a *separate type* that has no such property. See
> [AUTHORIZATION_MATRIX.md](./AUTHORIZATION_MATRIX.md).

### `QuizAttempt`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `quizId` | String | ✓ | → `Quiz`, `Cascade` |
| `studentId` | String | ✓ | → `Student`, `Restrict` |
| `status` | `AttemptStatus` | ✓ | `IN_PROGRESS` \| `SUBMITTED` \| `GRADED` |
| `startedAt` | DateTime | ✓ | |
| `expiresAt` | DateTime | – | **Server-computed** at start: `startedAt + timeLimitMinutes` |
| `submittedAt` | DateTime | – | |
| `score` | Decimal(6,2) | – | |
| `gradedAt` | DateTime | – | |

`@@unique([quizId, studentId])` — single attempt, enforced by the database.

`expiresAt` is written by the server at start and never trusted from the client. A submission
arriving after it is rejected, and the attempt is auto-graded on whatever was answered.

### `QuizAnswer`

`id`, `organizationId`, `attemptId` (`Cascade`), `questionId` (`Restrict`), `selectedOptionId`
(nullable, `Restrict`), `isCorrect` Boolean?, `pointsAwarded` Decimal?, `answeredAt`.

`@@unique([attemptId, questionId])`

Writable only while the attempt is `IN_PROGRESS`. `isCorrect` and `pointsAwarded` are filled by the
auto-grader on submit.

### `Exam` — offline

`id`, `organizationId`, `classSubjectId` (`Restrict`), `termId` (`Restrict`), `gradeCategoryId`
(nullable), `title`, `titleAr`, `scheduledAt`, `durationMinutes`, `room`, `maxScore` Decimal,
`status` (`SCHEDULED` \| `COMPLETED` \| `CANCELLED`), timestamps.

### `ExamMark`

`id`, `organizationId`, `examId` (`Cascade`), `studentId` (`Restrict`), `score` Decimal, `note`,
`recordedById`, `recordedAt`, timestamps. `@@unique([examId, studentId])`

---

## 9. Grading and results

**Answering "how does `Quiz` relate to grading?"** — identically to `Assignment` and `Exam`. All
three carry an optional `gradeCategoryId`. Their scores live on their own child tables
(`AssignmentSubmission.score`, `QuizAttempt.score`, `ExamMark.score`). There is no shared
`GradedItem` supertype and no unified `Mark` table.

> **Why not a polymorphic `GradedItem`?** It would buy one simpler aggregation query at the cost of
> a join on every read of an assignment, quiz, or exam, plus a polymorphic FK that Prisma models
> badly. The aggregation runs **once per publish**, not per page view. Denormalizing for a rare
> operation is the wrong trade.

### `GradingScheme`

`id`, `organizationId`, `classSubjectId` (`@unique`, `Cascade`), `name`, timestamps.

One scheme per class-subject. Year scoping is inherited from `Class`.

### `GradeCategory`

`id`, `organizationId`, `gradingSchemeId` (`Cascade`), `name`, `nameAr`, `weight` Decimal(5,2),
`order` Int. `@@unique([gradingSchemeId, name])`

Weights sum to 100 per scheme — service-enforced in a transaction (§1).

### `Result` — the published snapshot

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `studentId` | String | ✓ | → `Student`, `Restrict` |
| `classSubjectId` | String | ✓ | → `ClassSubject`, `Restrict` |
| `termId` | String | ✓ | → `Term`, `Restrict` |
| `version` | Int | ✓ | Starts at 1 |
| `score` | Decimal(6,2) | ✓ | Final weighted percentage |
| `letterGrade` | String | – | |
| `breakdown` | Json | ✓ | **Per-category math frozen at publish time** |
| `comment` | String | – | Teacher remark |
| `publishedAt` | DateTime | ✓ | |
| `publishedById` | String | ✓ | |
| `supersededAt` | DateTime | – | Set when a correction replaces this row |
| `supersededById` | String | – | → the newer `Result` |
| `correctionReason` | String | – | **Required when `version > 1`** |

`@@unique([studentId, classSubjectId, termId, version])`
`@@index([organizationId, termId, classSubjectId])`

**Answering "how are published results represented?" and "how does `Result` relate to `Grade`,
`Mark`, and `GradingScheme`?"**

- `GradingScheme` + `GradeCategory` are the **rules**.
- `AssignmentSubmission.score`, `QuizAttempt.score`, `ExamMark.score` are the **raw scores**. There
  is no `Grade` entity and no `Mark` entity — see [GLOSSARY.md](./GLOSSARY.md).
- `Result` is the **frozen output**: computed at publish time inside one transaction, then never
  updated.
- `breakdown` stores the category-level arithmetic as it stood at publication:
  `[{ categoryId, name, weight, earned, possible, weightedScore }]`. This is what makes immutability
  meaningful — a parent can still see *how* a number was reached even after the underlying
  submissions change.
- A correction inserts `version + 1` with `correctionReason`, sets `supersededAt`/`supersededById`
  on the old row, and writes an `AuditLog` entry. Nothing is ever overwritten.

---

## 10. Attendance

**Answering "how does attendance relate to timetable sessions and lessons?"** — attendance attaches
to the **timetable slot**, not to the lesson. A `Lesson` is content; a `TimetableSlot` is time. Both
reference the slot, and neither depends on the other, so a register can be taken for a period where
no lesson content was ever posted.

### `AttendanceSession`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `timetableSlotId` | String | ✓ | → `TimetableSlot`, `Restrict` |
| `classSubjectId` | String | ✓ | Denormalized from the slot, for query indexing |
| `date` | DateTime `@db.Date` | ✓ | Resolved in the organization's timezone |
| `takenById` | String | ✓ | → `Teacher` |
| `takenAt` | DateTime | ✓ | |
| `editableUntil` | DateTime | ✓ | `takenAt + attendanceEditWindowHours`, frozen at creation |

`@@unique([timetableSlotId, date])` · `@@index([organizationId, classSubjectId, date])`

> `editableUntil` is stored rather than computed so that changing the organization's policy later
> does not retroactively reopen or close historical sessions. Same reasoning as `Result.breakdown`.

`timetableSlotId` is **required** — attendance always belongs to a scheduled period. This keeps the
unique constraint clean (no NULL-distinct trap) and matches the product rule that attendance cannot
be recorded outside the timetable.

### `AttendanceEntry`

`id`, `organizationId`, `sessionId` (`Cascade`), `studentId` (`Restrict`), `status`
(`PRESENT` \| `ABSENT` \| `LATE` \| `EXCUSED`), `note`, timestamps.

`@@unique([sessionId, studentId])` · `@@index([organizationId, studentId, status])`

Written as a single bulk upsert inside one transaction.

---

## 11. Communication

### `Event`

`id`, `organizationId`, `title`, `titleAr`, `description`, `type` (`SCHOOL_EVENT` \| `HOLIDAY` \|
`PARENT_MEETING` \| `EXAM` \| `ACTIVITY` \| `TRIP`), `startAt`, `endAt`, `allDay`, `location`,
`audienceType` (`ALL` \| `ROLE` \| `CLASS`), `audienceRoles Role[]`, `createdById`, timestamps.

`EventClass(eventId, classId)` — `@@unique([eventId, classId])`, `Cascade`.

### `Announcement`

`id`, `organizationId`, `title`, `titleAr`, `body`, `bodyAr`, `status` (`DRAFT` \| `SCHEDULED` \|
`PUBLISHED` \| `ARCHIVED`), `publishAt`, `publishedAt`, `audienceType`, `audienceRoles Role[]`,
`createdById`, timestamps.

`AnnouncementClass(announcementId, classId)` · `AnnouncementAttachment(announcementId, fileAssetId)`

> Targeting is modeled identically on both: an `audienceType` discriminator, a role array for
> `ROLE`, and a join table for `CLASS`. One pattern, two entities — not an abstraction.

### `Notification`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `recipientUserId` | String | ✓ | → `user`, `Cascade` |
| `type` | `NotificationType` | ✓ | |
| `titleKey` / `messageKey` | String | ✓ | **Translation keys, not rendered text** |
| `params` | Json | ✓ | Interpolation values |
| `resourceType` / `resourceId` | String | – | Deep link target |
| `readAt` | DateTime | – | |
| `createdAt` | DateTime | ✓ | |

`@@index([recipientUserId, readAt])` · `@@index([organizationId, createdAt])`

Storing keys rather than sentences is what lets a notification written under an English session
render correctly in Arabic later.

---

## 12. AI

### `AIConversation`

`id`, `organizationId`, `userId` (`Cascade`), `title`, timestamps.
`@@index([organizationId, userId, updatedAt])`

### `AIMessage`

`id`, `organizationId`, `conversationId` (`Cascade`), `role` (`SYSTEM` \| `USER` \| `ASSISTANT` \|
`TOOL`), `content`, `toolCalls` Json?, `toolCallId`?, `tokensIn`?, `tokensOut`?, `createdAt`.

### `DocumentChunk`

| Field | Type | Req | Notes |
|---|---|---|---|
| `id`, `organizationId` | String | ✓ | |
| `sourceType` | `DocumentSourceType` | ✓ | `LESSON` \| `LESSON_RESOURCE` \| `ANNOUNCEMENT` \| `DOCUMENT` |
| `sourceId` | String | ✓ | |
| `fileAssetId` | String | – | → `FileAsset`, `Cascade` |
| `content` | String | ✓ | The chunk text |
| `chunkIndex` | Int | ✓ | |
| `tokenCount` | Int | – | |
| `embedding` | `Unsupported("vector(1536)")` | ✓ | pgvector |

`@@index([organizationId, sourceType, sourceId])`

**Implementation constraints to carry into Phase 6:**

1. Prisma has no native pgvector type. The column is declared `Unsupported(...)`, which means
   **similarity queries must use `$queryRaw`** and the column cannot be selected through the normal
   client. Plan for a hand-written repository method.
2. The vector index is created by raw SQL in a migration:
   `CREATE INDEX ON "DocumentChunk" USING hnsw (embedding vector_cosine_ops);`
3. **`organizationId` must be applied as a filter *before* the similarity search**, inside the same
   raw query. A vector search without a tenant pre-filter will happily return another organization's
   document as the nearest neighbor. This is the single most dangerous query in the system, and the
   Prisma tenant extension **does not cover `$queryRaw`** — it must be written by hand and tested.

---

## 13. Platform

### `FileAsset`

`id`, `organizationId`, `uploadedById`, `cloudinaryPublicId` (`@unique`), `url`, `secureUrl`,
`originalName`, `mimeType`, `sizeBytes` Int, `context` (`AVATAR` \| `LESSON_RESOURCE` \|
`ASSIGNMENT_RESOURCE` \| `SUBMISSION` \| `ANNOUNCEMENT` \| `DOCUMENT`), `createdAt`, `deletedAt`.

`@@index([organizationId, context])`

`sizeBytes` feeds the `STORAGE_MB` usage counter, incremented in the same transaction as the insert
and decremented on delete.

### `AuditLog`

`id`, `organizationId`, `actorUserId`?, `action` String, `resourceType` String, `resourceId` String,
`before` Json?, `after` Json?, `reason` String?, `ipAddress`?, `userAgent`?, `requestId`?,
`createdAt`.

`@@index([organizationId, resourceType, resourceId, createdAt])` · `@@index([organizationId, actorUserId, createdAt])`

**Insert-only.** There is deliberately no `updatedAt` column and no update or delete path in the
repository. `actorUserId` is nullable so system-generated actions can be recorded.

---

## 14. Enum reference

| Enum | Values |
|---|---|
| `Role` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` |
| `Locale` | `EN`, `AR` |
| `Gender` | `MALE`, `FEMALE` |
| `Relationship` | `FATHER`, `MOTHER`, `GUARDIAN`, `OTHER` |
| `ProfileStatus` | `ACTIVE`, `INACTIVE`, `GRADUATED`, `TRANSFERRED`, `ARCHIVED` |
| `AcademicYearStatus` | `UPCOMING`, `ACTIVE`, `CLOSED` |
| `EnrollmentStatus` | `ACTIVE`, `TRANSFERRED`, `WITHDRAWN`, `COMPLETED` |
| `DayOfWeek` | `SUNDAY` … `SATURDAY` |
| `LessonStatus` | `DRAFT`, `PUBLISHED` |
| `AssignmentStatus` | `DRAFT`, `PUBLISHED`, `CLOSED` |
| `SubmissionStatus` | `SUBMITTED`, `LATE`, `GRADED`, `RETURNED` |
| `QuizStatus` | `DRAFT`, `PUBLISHED`, `CLOSED` |
| `QuestionType` | `MULTIPLE_CHOICE`, `TRUE_FALSE` |
| `AttemptStatus` | `IN_PROGRESS`, `SUBMITTED`, `GRADED` |
| `ExamStatus` | `SCHEDULED`, `COMPLETED`, `CANCELLED` |
| `AttendanceStatus` | `PRESENT`, `ABSENT`, `LATE`, `EXCUSED` |
| `EventType` | `SCHOOL_EVENT`, `HOLIDAY`, `PARENT_MEETING`, `EXAM`, `ACTIVITY`, `TRIP` |
| `AudienceType` | `ALL`, `ROLE`, `CLASS` |
| `AnnouncementStatus` | `DRAFT`, `SCHEDULED`, `PUBLISHED`, `ARCHIVED` |
| `NotificationType` | `ANNOUNCEMENT`, `ASSIGNMENT_DUE`, `ASSIGNMENT_GRADED`, `QUIZ_PUBLISHED`, `RESULT_PUBLISHED`, `ATTENDANCE_WARNING`, `EVENT_REMINDER` |
| `AIMessageRole` | `SYSTEM`, `USER`, `ASSISTANT`, `TOOL` |
| `DocumentSourceType` | `LESSON`, `LESSON_RESOURCE`, `ANNOUNCEMENT`, `DOCUMENT` |
| `FileContext` | `AVATAR`, `LESSON_RESOURCE`, `ASSIGNMENT_RESOURCE`, `SUBMISSION`, `ANNOUNCEMENT`, `DOCUMENT` |
| `SubscriptionStatus` | `TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `EXPIRED` |
| `UsageMetric` | `STUDENTS`, `TEACHERS`, `STORAGE_MB`, `AI_REQUESTS` |

---

## 15. Index strategy

`organizationId` **leads every composite index** on tenant-scoped models, because the tenant
extension makes it the leading predicate of every query without exception.

Beyond that, indexes exist only where a known query pattern demands one:

| Index | Serves |
|---|---|
| `ClassSubject(organizationId, teacherId)` | Teacher authorization — "may this teacher touch this record?" runs on nearly every request |
| `StudentEnrollment(organizationId, classId, status)` | Class roster listing |
| `AttendanceEntry(organizationId, studentId, status)` | Attendance rate per student |
| `Result(organizationId, termId, classSubjectId)` | Results dashboards and analytics grouping |
| `Assignment(organizationId, classSubjectId, dueAt)` | Upcoming/overdue queries on three dashboards |
| `Notification(recipientUserId, readAt)` | Unread badge count, hit on every page load |
| `DocumentChunk(organizationId, sourceType, sourceId)` | RAG pre-filter and re-embedding |

Add nothing else until `EXPLAIN` justifies it.
