import { rawPrisma } from './db/prisma'
import { runWithOrganization } from './tenant/context'

async function main() {
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

  const organization = await rawPrisma.organization.upsert({
    where: { slug: 'karma-demo' },
    create: { id: 'karma-demo-id', name: 'Karma Demo School', slug: 'karma-demo' },
    update: {},
  })

  await rawPrisma.subscription.upsert({
    where: { id: `${organization.id}-seed-subscription` },
    create: {
      id: `${organization.id}-seed-subscription`,
      organizationId: organization.id,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
    },
    update: {},
  })

  await runWithOrganization(organization.id, async () => {
    await rawPrisma.organizationSettings.upsert({
      where: { organizationId: organization.id },
      create: { organizationId: organization.id, timezone: 'Africa/Cairo', defaultLocale: 'EN' },
      update: {},
    })
  })

  console.log(`Seeded organization ${organization.slug} (${organization.id}) on plan ${plan.code}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => rawPrisma.$disconnect())
