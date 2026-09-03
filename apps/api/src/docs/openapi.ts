export const openapiSpecification = {
  openapi: '3.0.3',
  info: {
    title: 'Karma School Management API',
    version: '1.0.0',
    description:
      'Multi-tenant enterprise school management platform. Features Better Auth RBAC, tenant-isolated academic records, and immutable grading snapshots.',
    contact: {
      name: 'Karma Platform Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server',
    },
    {
      url: 'https://karma-api.vercel.app',
      description: 'Production Vercel Serverless',
    },
  ],
  tags: [
    { name: 'System', description: 'System health, telemetry, and uptime' },
    { name: 'Authentication', description: 'Better Auth sessions, invitations, and login flows' },
    { name: 'Students', description: 'Student profiles, academic history, and enrollment' },
    { name: 'Teachers', description: 'Teacher qualifications, homeroom, and subject assignments' },
    { name: 'Academic', description: 'Academic years, terms, classes, and subjects' },
    { name: 'Lessons', description: 'Curriculum delivery, lesson plans, and learning materials' },
    { name: 'Assignments', description: 'Homework, term papers, student submissions, and teacher grading' },
    { name: 'Grading & Results', description: 'Grading schemes, frozen report cards, and immutable correction logs' },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description: 'HTTP-only session cookie issued upon authentication',
      },
      tenantHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'x-organization-id',
        description: 'Active Organization ID header for multi-tenant routing',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              message: { type: 'string', example: 'Validation failed' },
              details: { type: 'object' },
            },
          },
          requestId: { type: 'string', example: 'req_123' },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status', 'timestamp'],
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time', example: '2026-09-02T20:00:00.000Z' },
        },
      },
    },
  },
  paths: {
    '/healthz': {
      get: {
        tags: ['System'],
        summary: 'Health check probe',
        description: 'Used by load balancers, orchestrators, and uptime monitors.',
        responses: {
          200: {
            description: 'API is healthy and responsive',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/sign-up/email': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user with email & password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'teacher@karma.dev' },
                  password: { type: 'string', format: 'password', example: 'StrongPassword123!' },
                  name: { type: 'string', example: 'Mona Ali' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User account created and session issued' },
          400: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/api/auth/sign-in/email': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email & password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'teacher@karma.dev' },
                  password: { type: 'string', format: 'password', example: 'StrongPassword123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful; session cookie set' },
          401: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/api/auth/get-session': {
      get: {
        tags: ['Authentication'],
        summary: 'Retrieve authenticated session and user details',
        security: [{ sessionCookie: [] }],
        responses: {
          200: { description: 'Session payload containing user and active organization' },
          401: { description: 'Unauthenticated' },
        },
      },
    },
    // Students
    '/api/students': {
      post: {
        tags: ['Students'],
        summary: 'Create student profile (ADMIN only)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'studentCode', 'firstName', 'lastName', 'dateOfBirth', 'admissionDate'],
                properties: {
                  userId: { type: 'string' },
                  studentCode: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  firstNameAr: { type: 'string' },
                  lastNameAr: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                  admissionDate: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Student profile created' },
          400: { $ref: '#/components/schemas/ErrorResponse' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - ADMIN only' },
        },
      },
      get: {
        tags: ['Students'],
        summary: 'List students with optional search & pagination',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of students' },
        },
      },
    },
    '/api/students/{id}': {
      get: {
        tags: ['Students'],
        summary: 'Get student details by ID',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Student details' },
          404: { description: 'Student not found' },
        },
      },
    },
    '/api/students/{id}/enroll': {
      post: {
        tags: ['Students'],
        summary: 'Enroll or transfer student into a class',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['classId', 'academicYearId'],
                properties: {
                  classId: { type: 'string' },
                  academicYearId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Student enrolled' },
        },
      },
    },
    '/api/students/{id}/parents': {
      post: {
        tags: ['Students'],
        summary: 'Link a parent to a student',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['parentId', 'relationship'],
                properties: {
                  parentId: { type: 'string' },
                  relationship: { type: 'string', enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'] },
                  isPrimaryContact: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Parent linked successfully' },
        },
      },
    },
    // Teachers
    '/api/teachers': {
      post: {
        tags: ['Teachers'],
        summary: 'Register teacher profile (ADMIN only)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'employeeCode', 'firstName', 'lastName', 'hireDate'],
                properties: {
                  userId: { type: 'string' },
                  employeeCode: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  hireDate: { type: 'string', format: 'date' },
                  specialization: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Teacher profile created' },
        },
      },
      get: {
        tags: ['Teachers'],
        summary: 'List teachers',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        responses: {
          200: { description: 'List of teachers' },
        },
      },
    },
    '/api/teachers/{id}/qualifications': {
      post: {
        tags: ['Teachers'],
        summary: 'Add subject qualification to teacher',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subjectId'],
                properties: {
                  subjectId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Subject qualification added' },
        },
      },
    },
    // Academic
    '/api/academic/years': {
      post: {
        tags: ['Academic'],
        summary: 'Create academic year (enforces exactly 1 active year)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'startDate', 'endDate'],
                properties: {
                  name: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                  status: { type: 'string', enum: ['UPCOMING', 'ACTIVE', 'CLOSED', 'ARCHIVED'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Academic year created' },
        },
      },
    },
    '/api/academic/terms': {
      post: {
        tags: ['Academic'],
        summary: 'Create academic term',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['academicYearId', 'name', 'order', 'startDate', 'endDate'],
                properties: {
                  academicYearId: { type: 'string' },
                  name: { type: 'string' },
                  order: { type: 'integer' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Term created' },
        },
      },
    },
    '/api/academic/subjects': {
      post: {
        tags: ['Academic'],
        summary: 'Create subject',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Subject created' },
        },
      },
    },
    '/api/academic/classes': {
      post: {
        tags: ['Academic'],
        summary: 'Create class',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['academicYearId', 'name', 'gradeLevel'],
                properties: {
                  academicYearId: { type: 'string' },
                  name: { type: 'string' },
                  gradeLevel: { type: 'integer' },
                  section: { type: 'string' },
                  capacity: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Class created' },
        },
      },
    },
    '/api/academic/classes/{id}/subjects': {
      post: {
        tags: ['Academic'],
        summary: 'Assign teacher to teach class subject (enforces teacher qualification)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subjectId', 'teacherId'],
                properties: {
                  subjectId: { type: 'string' },
                  teacherId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Subject assigned to class' },
        },
      },
    },
    // Results & Grading
    '/api/results/publish': {
      post: {
        tags: ['Grading & Results'],
        summary: 'Freeze and publish student grade snapshot',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['studentId', 'classSubjectId', 'termId', 'score', 'breakdown'],
                properties: {
                  studentId: { type: 'string' },
                  classSubjectId: { type: 'string' },
                  termId: { type: 'string' },
                  score: { type: 'number' },
                  letterGrade: { type: 'string' },
                  breakdown: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['category', 'weight', 'earned', 'possible'],
                      properties: {
                        category: { type: 'string' },
                        weight: { type: 'number' },
                        earned: { type: 'number' },
                        possible: { type: 'number' },
                      },
                    },
                  },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Result snapshot published' },
        },
      },
    },
    '/api/results/{id}/correct': {
      post: {
        tags: ['Grading & Results'],
        summary: 'Issue immutable grade correction (version + 1) with audit reason',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newScore', 'newBreakdown', 'correctionReason'],
                properties: {
                  newScore: { type: 'number' },
                  newLetterGrade: { type: 'string' },
                  newBreakdown: { type: 'array', items: { type: 'object' } },
                  correctionReason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Result corrected and prior version superseded' },
        },
      },
    },
    // Lessons
    '/api/lessons': {
      post: {
        tags: ['Lessons'],
        summary: 'Create lesson (TEACHER or ADMIN)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['classSubjectId', 'title'],
                properties: {
                  classSubjectId: { type: 'string' },
                  title: { type: 'string' },
                  titleAr: { type: 'string' },
                  description: { type: 'string' },
                  content: { type: 'string' },
                  scheduledAt: { type: 'string', format: 'date-time' },
                  status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Lesson created' },
        },
      },
      get: {
        tags: ['Lessons'],
        summary: 'List lessons for a class/subject',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [
          { name: 'classSubjectId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] } },
        ],
        responses: {
          200: { description: 'List of lessons' },
        },
      },
    },
    '/api/lessons/{id}': {
      get: {
        tags: ['Lessons'],
        summary: 'Get lesson details (Students see published only)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Lesson details' },
          404: { description: 'Lesson not found' },
        },
      },
    },
    '/api/lessons/{id}/publish': {
      post: {
        tags: ['Lessons'],
        summary: 'Publish draft lesson (TEACHER or ADMIN)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Lesson published' },
        },
      },
    },
    // Assignments
    '/api/assignments': {
      post: {
        tags: ['Assignments'],
        summary: 'Create assignment (TEACHER or ADMIN)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['classSubjectId', 'title', 'maxScore', 'dueAt'],
                properties: {
                  classSubjectId: { type: 'string' },
                  gradeCategoryId: { type: 'string' },
                  title: { type: 'string' },
                  titleAr: { type: 'string' },
                  description: { type: 'string' },
                  instructions: { type: 'string' },
                  maxScore: { type: 'number', minimum: 1 },
                  dueAt: { type: 'string', format: 'date-time' },
                  lateUntil: { type: 'string', format: 'date-time' },
                  allowLateSubmission: { type: 'boolean' },
                  status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Assignment created' },
        },
      },
      get: {
        tags: ['Assignments'],
        summary: 'List assignments for a class/subject',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [
          { name: 'classSubjectId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CLOSED'] } },
        ],
        responses: {
          200: { description: 'List of assignments' },
        },
      },
    },
    '/api/assignments/{id}': {
      get: {
        tags: ['Assignments'],
        summary: 'Get assignment details',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Assignment details' },
          404: { description: 'Assignment not found' },
        },
      },
    },
    '/api/assignments/{id}/submit': {
      post: {
        tags: ['Assignments'],
        summary: 'Submit work for an assignment (STUDENT only)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Submission recorded' },
          400: { description: 'Deadline passed or invalid payload' },
        },
      },
    },
    '/api/assignments/submissions/{id}/grade': {
      post: {
        tags: ['Assignments'],
        summary: 'Grade a student submission (TEACHER only)',
        security: [{ sessionCookie: [] }, { tenantHeader: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['score'],
                properties: {
                  score: { type: 'number', minimum: 0 },
                  feedback: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Submission graded' },
        },
      },
    },
  },
}
