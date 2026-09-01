# Karma — Authorization Matrix

> The specification, the review checklist, and the test fixture — one document.
>
> This file is written to be **mechanically translatable into a table-driven test**. Every row is a
> case: given a role, a resource, an action, and a scope, the API either allows or denies. See §26 of
> the blueprint.

---

## 1. How authorization works

Three independent layers. All three must pass. Confusing them is how authorization bugs happen.

| Layer | Question | Enforced by | Failure |
|---|---|---|---|
| **Tenancy** | Does this row exist for my organization? | Prisma client extension | **404** |
| **Role** | Does my role permit this action at all? | Route guard from this matrix | **403** |
| **Resource** | May I do this to *this specific record*? | Service-layer ownership check | **403**, or **404** where existence is sensitive |

**Cross-tenant access always returns 404, never 403.** A 403 confirms the record exists somewhere,
which leaks the existence of another organization's data. The tenant extension makes this automatic:
the row simply is not found.

## 2. Scope vocabulary

Every allow below is qualified by exactly one scope.

| Scope | Meaning |
|---|---|
| `ANY` | All records within the caller's organization |
| `ASSIGNED` | Records reachable through `ClassSubject.teacherId = me` — the teacher's own class-subjects |
| `HOMEROOM` | Records for a class where `Class.homeroomTeacherId = me` |
| `OWN` | Records where the subject *is* the caller (`Student.userId = me`, `Teacher.userId = me`) |
| `CHILDREN` | Records for students linked via `ParentStudent.parentId = me` |
| `PUBLISHED` | Only records whose status is published/active; drafts are invisible |
| `SELF` | The caller's own user/profile record |
| `NONE` | Denied outright |

**Composite scopes** are written with `+`: `ASSIGNED + PUBLISHED` means both conditions apply.

## 3. Reading the tables

- `✅` allow · `❌` deny
- Actions: `create`, `read`, `list`, `update`, `delete`, `archive`, `publish`, `submit`, `grade`,
  `assign`, `approve`, `export`, `manage`
- `manage` = full CRUD on the resource, used to compress admin rows
- Where a role is absent from a table, the answer is **deny**

---

## 4. Identity & organization

### Users, invitations, memberships

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | invite | ANY | ✅ | Checks `maxStudents`/`maxTeachers` before issuing |
| Admin | list / read | ANY | ✅ | |
| Admin | update role | ANY | ✅ | Audited. Cannot remove the last admin |
| Admin | archive | ANY | ✅ | Never hard-deletes |
| Admin | read | SELF | ✅ | |
| Teacher / Student / Parent | read | SELF | ✅ | Own user record only |
| Teacher / Student / Parent | list | — | ❌ | No user directory for non-admins |
| Teacher / Student / Parent | invite / update role / archive | — | ❌ | |
| **Any** | change own password | SELF | ✅ | Via Better Auth |
| **Any** | read another user's email/phone | — | ❌ | Except through a permitted profile view below |

### Organization, plan, subscription, usage

| Role | Resource | Action | Scope | | Notes |
|---|---|---|---|---|---|
| Admin | Organization settings | read / update | ANY | ✅ | Timezone, locale, edit window. Audited |
| Admin | Subscription | read | ANY | ✅ | **Read-only in MVP** — no plan changes, no checkout |
| Admin | Usage counters | read | ANY | ✅ | |
| Admin | Plan catalogue | read | ANY | ✅ | Platform-level; read-only to all |
| Teacher / Student / Parent | all of the above | — | — | ❌ | Not exposed in navigation |
| **Any** | Subscription | create / update / delete | — | ❌ | No API path exists in MVP |

---

## 5. Profiles

### Students

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / archive | ANY | ✅ | Create enforces `maxStudents` |
| Admin | list / read | ANY | ✅ | |
| Teacher | list / read | ASSIGNED | ✅ | Students enrolled in a class the teacher teaches |
| Teacher | read | HOMEROOM | ✅ | Full profile for their homeroom class |
| Teacher | create / update / archive | — | ❌ | |
| Student | read | OWN | ✅ | |
| Student | update | OWN | ✅ | Contact fields and avatar only — never `studentCode`, `status`, or enrollment |
| Student | list | — | ❌ | A student cannot enumerate classmates |
| Parent | read | CHILDREN | ✅ | |
| Parent | update | CHILDREN | ✅ | Contact fields only |
| Parent | list | CHILDREN | ✅ | Their own children only |

### Teachers

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / archive | ANY | ✅ | Create enforces `maxTeachers` |
| Admin | list / read | ANY | ✅ | Including workload and assignments |
| Teacher | read / update | OWN | ✅ | Own profile; not `employeeCode` or `status` |
| Teacher | list | ANY | ✅ | **Name and subject only** — a reduced DTO, no contact details |
| Student / Parent | read | ASSIGNED | ✅ | Name and subject of teachers who teach them / their child. Reduced DTO |
| Student / Parent | list all | — | ❌ | |

### Parents

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / archive / list / read | ANY | ✅ | |
| Admin | link / unlink child | ANY | ✅ | **Only an admin creates `ParentStudent` rows.** Audited |
| Teacher | read | ASSIGNED | ✅ | Contact details for parents of students they teach |
| Parent | read / update | SELF | ✅ | |
| Parent | link own child | — | ❌ | Self-claiming a child is never permitted |
| Student | read | — | ❌ | |

---

## 6. Academic structure

### Academic years & terms

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / delete | ANY | ✅ | Delete only while no dependent records exist |
| Admin | activate / close | ANY | ✅ | Audited. Exactly one `ACTIVE` year |
| Teacher / Student / Parent | list / read | ANY | ✅ | Needed to populate every filter in the UI |
| Teacher / Student / Parent | create / update / close | — | ❌ | |

### Classes

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / archive | ANY | ✅ | |
| Admin | enroll / transfer student | ANY | ✅ | Audited |
| Admin | assign homeroom teacher | ANY | ✅ | |
| Teacher | list / read | ASSIGNED | ✅ | |
| Teacher | read roster | ASSIGNED | ✅ | |
| Teacher | update / enroll | — | ❌ | Teachers do not manage enrollment |
| Student | read | OWN | ✅ | Their own class |
| Student | read roster | — | ❌ | |
| Parent | read | CHILDREN | ✅ | |

### Subjects

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / archive / list / read | ANY | ✅ | |
| Admin | assign teacher qualification (`TeacherSubject`) | ANY | ✅ | |
| Admin | assign teacher to class-subject (`ClassSubject`) | ANY | ✅ | Validates a matching `TeacherSubject` exists |
| Teacher | list / read | ANY | ✅ | |
| Teacher | assign self | — | ❌ | A teacher cannot grant themselves a class |
| Student / Parent | list / read | ANY | ✅ | Reference data |

### Timetable

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / delete | ANY | ✅ | Conflict validation on save |
| Admin | read | ANY | ✅ | |
| Teacher | read | OWN | ✅ | Personal weekly grid |
| Teacher | read | ASSIGNED | ✅ | Grid for classes they teach |
| Teacher | create / update | — | ❌ | |
| Student | read | OWN | ✅ | Their class's grid |
| Parent | read | CHILDREN | ✅ | |

---

## 7. Learning

### Lessons

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | manage | ANY | ✅ | |
| Teacher | create / update / delete | ASSIGNED | ✅ | Only for their own class-subjects |
| Teacher | publish / unpublish | ASSIGNED | ✅ | |
| Teacher | read | ASSIGNED | ✅ | Including drafts |
| Student | read | OWN + PUBLISHED | ✅ | **Drafts must not be listed or readable by ID** |
| Parent | read | CHILDREN + PUBLISHED | ✅ | |
| Student / Parent | create / update / publish | — | ❌ | |

### Assignments

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | manage | ANY | ✅ | |
| Teacher | create / update / delete | ASSIGNED | ✅ | Delete only while `DRAFT` |
| Teacher | publish / close / reopen | ASSIGNED | ✅ | Publish is audited |
| Teacher | read | ASSIGNED | ✅ | Including drafts |
| Student | read / list | OWN + PUBLISHED | ✅ | |
| Parent | read / list | CHILDREN + PUBLISHED | ✅ | |
| Student / Parent | create / update / publish | — | ❌ | |

### Submissions

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | read / list | ANY | ✅ | |
| Admin | grade | ANY | ✅ | Audited when overriding a teacher's grade |
| Teacher | list / read | ASSIGNED | ✅ | All submissions for their assignments |
| Teacher | grade | ASSIGNED | ✅ | Sets `score`, `feedback`, `gradedAt`, `gradedById` |
| Teacher | reopen for resubmission | ASSIGNED | ✅ | |
| Teacher | submit | — | ❌ | |
| Student | **submit** | OWN | ✅ | Only to a `PUBLISHED`, non-`CLOSED` assignment for their own class |
| Student | update (resubmit) | OWN | ✅ | **Only while not yet `GRADED`** |
| Student | read | OWN | ✅ | Including score and feedback |
| Student | read another student's submission | — | ❌ | The classic IDOR — an explicit test case |
| Parent | read | CHILDREN | ✅ | Read-only, including feedback |
| Parent | submit / update | — | ❌ | A parent never submits work |

---

## 8. Assessment

### Quizzes

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | manage | ANY | ✅ | |
| Teacher | create / update / delete | ASSIGNED | ✅ | **Questions immutable once an attempt exists** |
| Teacher | publish / close | ASSIGNED | ✅ | Publish freezes `totalPoints` |
| Teacher | read with answer key | ASSIGNED | ✅ | Teacher DTO includes `isCorrect` |
| Student | read | OWN + PUBLISHED | ✅ | **Student DTO has no `isCorrect` property at all** |
| Student | read answer key before submitting | — | ❌ | Highest-priority test case in this document |
| Student | read own results after submit | OWN | ✅ | Correct answers revealed only after `SUBMITTED` |
| Parent | read quiz metadata | CHILDREN + PUBLISHED | ✅ | Title, date, score — never questions or the key |

### Quiz attempts & answers

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Student | start attempt | OWN | ✅ | One only — `unique(quizId, studentId)`. `expiresAt` set server-side |
| Student | answer question | OWN | ✅ | **Only while `IN_PROGRESS` and before `expiresAt`** |
| Student | submit attempt | OWN | ✅ | Triggers auto-grading |
| Student | update answers after submit | — | ❌ | Answers are frozen |
| Student | read another student's attempt | — | ❌ | |
| Teacher | read attempts | ASSIGNED | ✅ | All attempts on their quizzes |
| Teacher | override score | ASSIGNED | ✅ | Audited |
| Parent | read attempt score | CHILDREN | ✅ | Score only, not answers |

### Exams & marks

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | manage exams / marks | ANY | ✅ | |
| Teacher | create / update / cancel exam | ASSIGNED | ✅ | |
| Teacher | record / update marks | ASSIGNED | ✅ | Audited on update |
| Student | read exam schedule | OWN | ✅ | |
| Student | read own mark | OWN + PUBLISHED | ✅ | Visible only once results are published |
| Parent | read schedule / mark | CHILDREN + PUBLISHED | ✅ | |

---

## 9. Grading & results

### Grading schemes and categories

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / delete | ANY | ✅ | Weights must sum to 100 |
| Teacher | read | ASSIGNED | ✅ | |
| Teacher | update | ASSIGNED | ✅ | **Denied once results are published for the term** |
| Student / Parent | read | OWN / CHILDREN | ✅ | Transparency: how the grade is composed |
| Student / Parent | update | — | ❌ | |

### Results

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | publish / unpublish | ANY | ✅ | Audited |
| Admin | correct (new version) | ANY | ✅ | Requires `correctionReason`. Audited |
| Admin | read | ANY | ✅ | Including superseded versions |
| Teacher | compute preview | ASSIGNED | ✅ | Unpublished calculation, teacher-only |
| Teacher | publish | ASSIGNED | ✅ | Where authorized for their class-subjects |
| Teacher | correct | ASSIGNED | ✅ | Requires reason. Audited |
| Teacher | read | ASSIGNED | ✅ | |
| Student | read | OWN + PUBLISHED | ✅ | **Latest version only** |
| Student | read unpublished / preview | — | ❌ | |
| Parent | read | CHILDREN + PUBLISHED | ✅ | Latest version, plus a correction notice |
| **Any** | update or delete a `Result` row | — | ❌ | **Append-only.** No update path exists in the repository |

---

## 10. Attendance

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / read / update / list | ANY | ✅ | May edit **outside** the window; always audited |
| Teacher | create session | ASSIGNED | ✅ | Only for their own timetable slots, date within the active year |
| Teacher | record entries | ASSIGNED | ✅ | Bulk upsert in one transaction |
| Teacher | update entries | ASSIGNED | ✅ | **Only while `now < editableUntil`** |
| Teacher | update after window | — | ❌ | Must ask an admin |
| Teacher | read | ASSIGNED | ✅ | |
| Teacher | read | HOMEROOM | ✅ | Full attendance for their homeroom class |
| Student | read | OWN | ✅ | Own history and rate |
| Student | read classmates' | — | ❌ | |
| Parent | read | CHILDREN | ✅ | |
| Student / Parent | create / update | — | ❌ | |

---

## 11. Communication

### Announcements

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | create / update / delete / publish / schedule | ANY | ✅ | Publish audited |
| Admin | read | ANY | ✅ | Including drafts |
| Teacher | create / publish | ASSIGNED | ✅ | May target **only classes they teach** |
| Teacher | update / delete | OWN | ✅ | Only announcements they authored |
| Teacher | read | PUBLISHED + targeted at them | ✅ | |
| Student | read | PUBLISHED + targeted | ✅ | Targeting resolves via role and enrollment |
| Parent | read | PUBLISHED + targeted at them or CHILDREN | ✅ | |
| Student / Parent | create | — | ❌ | |

### Events

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | manage | ANY | ✅ | |
| Teacher | create / update | ASSIGNED | ✅ | Targeting limited to their classes |
| Teacher / Student / Parent | read | targeted | ✅ | |
| Student / Parent | create / update | — | ❌ | |

### Notifications

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| **Any** | list / read | SELF | ✅ | `recipientUserId = me`, always |
| **Any** | mark read / mark all read | SELF | ✅ | |
| **Any** | delete | SELF | ✅ | Own notifications only |
| **Any** | read another user's | — | ❌ | |
| **Any** | create | — | ❌ | **No public create endpoint.** Notifications are produced only by domain events |

---

## 12. Insights

### Analytics

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | read | ANY | ✅ | School-wide dashboards, class and subject comparison |
| Teacher | read | ASSIGNED | ✅ | Their class-subjects only. **Aggregates must be computed over the scoped set, not filtered afterwards** |
| Teacher | read school-wide | — | ❌ | A school average would leak other classes' performance |
| Student | read | OWN | ✅ | Own trends only |
| Parent | read | CHILDREN | ✅ | Per-child trends |
| Student / Parent | class or cohort comparison | — | ❌ | Ranking against classmates is not exposed |

### Reports

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| Admin | generate / export | ANY | ✅ | CSV export audited |
| Teacher | generate / export | ASSIGNED | ✅ | |
| Student | generate | OWN | ✅ | Own progress report |
| Parent | generate | CHILDREN | ✅ | |
| Student / Parent | export school-wide | — | ❌ | |

### EduAI

| Role | Action | Scope | | Notes |
|---|---|---|---|---|
| **Any** | converse | SELF | ✅ | Subject to per-user rate limit and the `AI_REQUESTS` plan limit |
| **Any** | read conversation | SELF | ✅ | Own conversations only |
| **Any** | read another user's conversation | — | ❌ | |
| Admin | AI tool data access | ANY | ✅ | **Tools inherit the caller's scope exactly** |
| Teacher | AI tool data access | ASSIGNED | ✅ | |
| Student | AI tool data access | OWN | ✅ | |
| Parent | AI tool data access | CHILDREN | ✅ | |
| **Any** | RAG retrieval | own org + own permitted resources | ✅ | Tenant filter applied **before** similarity search |

> **The rule that makes this table true for AI:** every tool calls the same service method the REST
> endpoint calls, with the same context. There is no second authorization path. A row denied above is
> denied to the assistant by construction, not by prompt instruction.

---

## 13. Files, profile, settings, audit

| Role | Resource | Action | Scope | | Notes |
|---|---|---|---|---|---|
| **Any** | Own profile | read / update | SELF | ✅ | Name, avatar, locale, password |
| **Any** | Own avatar | upload | SELF | ✅ | Counts against `STORAGE_MB` |
| Admin | File assets | read / delete | ANY | ✅ | Delete removes the Cloudinary object and decrements usage |
| Teacher | File assets | upload | ASSIGNED | ✅ | Lesson and assignment resources |
| Teacher | File assets | read | ASSIGNED | ✅ | |
| Student | File assets | upload | OWN | ✅ | Submission attachments only |
| Student | File assets | read | attached to a resource they may read | ✅ | **Downloads are authorization-checked, never raw Cloudinary URLs** |
| Parent | File assets | read | CHILDREN's readable resources | ✅ | |
| Admin | Org settings | read / update | ANY | ✅ | Audited |
| Teacher / Student / Parent | Org settings | read | ANY | ✅ | Timezone and locale only, as a reduced DTO |
| Admin | Audit log | read / list | ANY | ✅ | |
| **Any** | Audit log | create / update / delete | — | ❌ | **Insert-only, written by services** |
| Teacher / Student / Parent | Audit log | read | — | ❌ | |

---

## 14. Cross-tenant rules — apply to every row above

These are not per-resource. They hold universally and are the first thing the test suite asserts.

| # | Rule | Expected |
|---|---|---|
| 1 | Any request for a record belonging to another organization | **404** |
| 2 | `organizationId` supplied in a body, query, header, or path | **Ignored** — always derived from the session |
| 3 | A user with no active membership | **401** |
| 4 | A membership whose organization is suspended | **403** |
| 5 | RAG retrieval executed through `$queryRaw` | Must carry an explicit `organizationId` filter — **the Prisma extension does not cover raw queries** |
| 6 | Background jobs and seed scripts | Must establish tenant context explicitly before touching tenant data |

---

## 15. Test fixture shape

This document is intended to compile into cases of the following shape:

```ts
type AuthzCase = {
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'
  resource: string          // 'submissions'
  action: string            // 'read'
  scope: Scope              // 'OWN'
  fixture: FixtureRef       // which seeded record to target
  expect: 200 | 201 | 403 | 404
}
```

**Priority cases** — the ones that would be most damaging if wrong, to be written first:

1. Student reads another student's submission → **403**
2. Student reads `QuizOption.isCorrect` before submitting → **field absent from the response**
3. Teacher reads a class-subject they are not assigned to → **403**
4. Parent reads a student they are not linked to → **403**
5. Any user reads any record from organization B → **404**
6. Student updates a submission already `GRADED` → **403**
7. Teacher edits attendance after `editableUntil` → **403**
8. Any actor issues `UPDATE` or `DELETE` against a `Result` row → **no such path exists**
9. Student lists unpublished lessons or assignments → **empty result, not a 403 leak**
10. RAG returns a chunk from organization B → **must be impossible**
