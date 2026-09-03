import { rawPrisma } from './db/prisma'
import { runWithOrganization } from './tenant/context'
import { auth } from './auth/auth'

async function getOrCreateUser(email: string, name: string, password: string) {
  const existing = await rawPrisma.user.findUnique({ where: { email } })
  if (existing) return existing

  try {
    const res = await auth.api.signUpEmail({
      body: { email, name, password },
    })
    return res.user
  } catch {
    return rawPrisma.user.findUniqueOrThrow({ where: { email } })
  }
}

async function main() {
  console.log('🌱 Starting full Karma Phase 1 database seed...')

  // 1. Subscription Plan
  const plan = await rawPrisma.plan.upsert({
    where: { code: 'SCHOOL' },
    create: {
      code: 'SCHOOL',
      name: 'School Plan',
      nameAr: 'خطة المدرسة',
      maxStudents: 500,
      maxTeachers: 50,
      storageMb: 5000,
      aiRequestsPerMonth: 1000,
    },
    update: {},
  })

  // 2. Demo School Organization
  const org = await rawPrisma.organization.upsert({
    where: { slug: 'karma-demo' },
    create: {
      id: 'demo-school-org',
      name: 'Karma Academy of Excellence',
      slug: 'karma-demo',
    },
    update: {
      name: 'Karma Academy of Excellence',
    },
  })

  await rawPrisma.subscription.upsert({
    where: { id: `${org.id}-subscription` },
    create: {
      id: `${org.id}-subscription`,
      organizationId: org.id,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
    },
    update: {},
  })

  await runWithOrganization(org.id, async () => {
    // 3. Organization Settings
    await rawPrisma.organizationSettings.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        timezone: 'Africa/Cairo',
        defaultLocale: 'EN',
      },
      update: {},
    })

    // 4. Users with Better Auth credentials
    console.log('Creating demo users (Admin, Teacher, Student, Parent)...')
    const adminUser = await getOrCreateUser('admin@karma.dev', 'Principal Sarah Jenkins', 'AdminPass123!')
    const teacherUser = await getOrCreateUser('teacher@karma.dev', 'Prof. Amina Zaki', 'TeacherPass123!')
    const studentUser = await getOrCreateUser('student@karma.dev', 'Youssef Nabil', 'StudentPass123!')
    const parentUser = await getOrCreateUser('parent@karma.dev', 'Nabil Mansour', 'ParentPass123!')

    // 5. Organization Memberships
    const memberships = [
      { userId: adminUser.id, role: 'ADMIN' },
      { userId: teacherUser.id, role: 'TEACHER' },
      { userId: studentUser.id, role: 'STUDENT' },
      { userId: parentUser.id, role: 'PARENT' },
    ]

    for (const m of memberships) {
      const existingMember = await rawPrisma.member.findFirst({
        where: { organizationId: org.id, userId: m.userId },
      })
      if (!existingMember) {
        await rawPrisma.member.create({
          data: {
            id: `mem-${m.role.toLowerCase()}-${Date.now()}`,
            organizationId: org.id,
            userId: m.userId,
            role: m.role,
          },
        })
      }
    }

    // 6. Profiles
    const teacher = await rawPrisma.teacher.upsert({
      where: { organizationId_employeeCode: { organizationId: org.id, employeeCode: 'EMP-2023-001' } },
      create: {
        organizationId: org.id,
        userId: teacherUser.id,
        employeeCode: 'EMP-2023-001',
        firstName: 'Amina',
        lastName: 'Zaki',
        firstNameAr: 'أمينة',
        lastNameAr: 'زكي',
        hireDate: new Date('2023-09-01'),
      },
      update: {},
    })

    const student = await rawPrisma.student.upsert({
      where: { organizationId_studentCode: { organizationId: org.id, studentCode: 'STU-2026-001' } },
      create: {
        organizationId: org.id,
        userId: studentUser.id,
        studentCode: 'STU-2026-001',
        firstName: 'Youssef',
        lastName: 'Nabil',
        firstNameAr: 'يوسف',
        lastNameAr: 'نبيل',
        dateOfBirth: new Date('2010-06-15'),
        admissionDate: new Date('2025-09-01'),
        gender: 'MALE',
      },
      update: {},
    })

    const parent = await rawPrisma.parent.upsert({
      where: { userId: parentUser.id },
      create: {
        organizationId: org.id,
        userId: parentUser.id,
        firstName: 'Nabil',
        lastName: 'Mansour',
        firstNameAr: 'نبيل',
        lastNameAr: 'منصور',
        phone: '+201000000000',
      },
      update: {},
    })

    // Link Parent to Student
    const existingLink = await rawPrisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId: parent.id, studentId: student.id } },
    })
    if (!existingLink) {
      await rawPrisma.parentStudent.create({
        data: {
          organizationId: org.id,
          parentId: parent.id,
          studentId: student.id,
          relationship: 'FATHER',
          isPrimaryContact: true,
        },
      })
    }

    // 7. Academic Structure
    console.log('Setting up academic calendar, classes, and subjects...')
    const academicYear = await rawPrisma.academicYear.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: 'Academic Year 2025/2026',
        },
      },
      create: {
        organizationId: org.id,
        name: 'Academic Year 2025/2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
      update: {},
    })

    const term = await rawPrisma.term.upsert({
      where: {
        academicYearId_name: {
          academicYearId: academicYear.id,
          name: 'Fall Term 2025/2026',
        },
      },
      create: {
        organizationId: org.id,
        academicYearId: academicYear.id,
        name: 'Fall Term 2025/2026',
        order: 1,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-01-20'),
      },
      update: {},
    })

    const classLiterature = await rawPrisma.class.upsert({
      where: { id: `${org.id}-class-grade-11-lit` },
      create: {
        id: `${org.id}-class-grade-11-lit`,
        organizationId: org.id,
        academicYearId: academicYear.id,
        name: 'Grade 11 Literature',
        gradeLevel: 11,
      },
      update: {},
    })

    const subjectLit = await rawPrisma.subject.upsert({
      where: { organizationId_code: { organizationId: org.id, code: 'LIT-101' } },
      create: {
        organizationId: org.id,
        code: 'LIT-101',
        name: 'World Literature',
        nameAr: 'الأدب العالمي',
      },
      update: {},
    })

    // Teacher Qualification
    await rawPrisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: subjectLit.id } },
      create: {
        organizationId: org.id,
        teacherId: teacher.id,
        subjectId: subjectLit.id,
      },
      update: {},
    })

    // Class Subject Allocation
    const classSubject = await rawPrisma.classSubject.upsert({
      where: { classId_subjectId: { classId: classLiterature.id, subjectId: subjectLit.id } },
      create: {
        organizationId: org.id,
        classId: classLiterature.id,
        subjectId: subjectLit.id,
        teacherId: teacher.id,
      },
      update: {},
    })

    // Student Class Enrollment
    await rawPrisma.studentEnrollment.upsert({
      where: {
        studentId_classId_academicYearId: {
          studentId: student.id,
          classId: classLiterature.id,
          academicYearId: academicYear.id,
        },
      },
      create: {
        organizationId: org.id,
        studentId: student.id,
        classId: classLiterature.id,
        academicYearId: academicYear.id,
        status: 'ACTIVE',
      },
      update: {},
    })

    // 8. Learning: Lessons & Assignments
    console.log('Seeding lessons, assignments, and student submissions...')
    await rawPrisma.lesson.upsert({
      where: { id: `${org.id}-lesson-modernist-poetry` },
      create: {
        id: `${org.id}-lesson-modernist-poetry`,
        organizationId: org.id,
        classSubjectId: classSubject.id,
        title: 'Introduction to Modernist Poetry',
        titleAr: 'مقدمة في الشعر الحديث',
        description: 'Textual analysis of T.S. Eliot and Ezra Pound motifs.',
        content: 'Detailed lecture notes on fragmentation, modernist disillusionment, and imagism.',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdById: teacherUser.id,
      },
      update: {},
    })

    const assignment = await rawPrisma.assignment.upsert({
      where: { id: `${org.id}-assignment-waste-land` },
      create: {
        id: `${org.id}-assignment-waste-land`,
        organizationId: org.id,
        classSubjectId: classSubject.id,
        title: 'Essay: The Waste Land Critical Analysis',
        titleAr: 'مقال: التحليل النقدي لقصيدة الأرض اليباب',
        description: 'Analyze motifs of fragmentation and historical allusions in 1,200 words.',
        maxScore: 50,
        dueAt: new Date(Date.now() + 7 * 86400000),
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdById: teacher.id,
      },
      update: {},
    })

    // Student Submission & Grading
    await rawPrisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: student.id,
        },
      },
      create: {
        organizationId: org.id,
        assignmentId: assignment.id,
        studentId: student.id,
        content: 'Here is my critical analysis on the burial of the dead motif in modernism.',
        submittedAt: new Date(Date.now() - 2 * 86400000),
        status: 'GRADED',
        score: 47.5,
        feedback: 'Insightful textual analysis and solid thesis construction.',
        gradedById: teacher.id,
        gradedAt: new Date(),
      },
      update: {},
    })

    // 9. Results & Audited Report Card
    console.log('Seeding audited report card snapshot...')
    const existingResult = await rawPrisma.result.findUnique({
      where: {
        studentId_classSubjectId_termId_version: {
          studentId: student.id,
          classSubjectId: classSubject.id,
          termId: term.id,
          version: 1,
        },
      },
    })

    if (!existingResult) {
      await rawPrisma.result.create({
        data: {
          organizationId: org.id,
          studentId: student.id,
          classSubjectId: classSubject.id,
          termId: term.id,
          version: 1,
          score: 94.5,
          letterGrade: 'A',
          publishedById: teacherUser.id,
          breakdown: [
            { category: 'Class Participation', score: 95, weight: 20 },
            { category: 'Midterm Essay', score: 92, weight: 30 },
            { category: 'Final Project', score: 96, weight: 50 },
          ],
        },
      })
    }

    console.log(`✅ Completed Phase 1 Seed for ${org.name} (${org.id})!`)
    console.log('----------------------------------------------------')
    console.log('Demo Credentials Ready for Live Use:')
    console.log('  👑 Admin:   admin@karma.dev   / AdminPass123!')
    console.log('  👩‍🏫 Teacher: teacher@karma.dev / TeacherPass123!')
    console.log('  👨‍🎓 Student: student@karma.dev / StudentPass123!')
    console.log('  👨‍👩‍👧 Parent:  parent@karma.dev  / ParentPass123!')
    console.log('----------------------------------------------------')
  })
}

main()
  .catch((err) => {
    console.error('❌ Error executing seed:', err)
    process.exit(1)
  })
  .finally(() => rawPrisma.$disconnect())
