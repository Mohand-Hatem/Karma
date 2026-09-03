import 'dotenv/config'
import { rawPrisma } from '../db/prisma'

async function cleanTestData() {
  console.log('Cleaning test organizations and orphan records from Supabase...')

  const deleted = await rawPrisma.organization.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'test-' } },
        { id: { startsWith: 'schema-test-' } },
        { name: { contains: 'Test' } },
      ],
    },
  })

  // Clean test users (excluding official seed demo accounts)
  const demoEmails = ['admin@karma.dev', 'teacher@karma.dev', 'student@karma.dev', 'parent@karma.dev']
  const deletedUsers = await rawPrisma.user.deleteMany({
    where: {
      AND: [
        { email: { notIn: demoEmails } },
        {
          OR: [
            { email: { contains: 'test' } },
            { email: { contains: '@karma.dev' } },
            { id: { startsWith: 'usr-std-' } },
            { id: { startsWith: 'usr-tch-' } },
          ],
        },
      ],
    },
  })

  console.log(
    `Successfully deleted ${deleted.count} test organization(s) and ${deletedUsers.count} test user(s). Database is clean.`
  )
  process.exit(0)
}

cleanTestData().catch((err) => {
  console.error('Error cleaning test data:', err)
  process.exit(1)
})
