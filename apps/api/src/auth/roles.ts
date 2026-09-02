import { createAccessControl } from 'better-auth/plugins/access'

const statement = {
  organization: ['update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
} as const

export const ac = createAccessControl(statement)

export const adminRole = ac.newRole({
  organization: ['update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
})

export const teacherRole = ac.newRole({})
export const studentRole = ac.newRole({})
export const parentRole = ac.newRole({})
