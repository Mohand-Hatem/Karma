import { AsyncLocalStorage } from 'node:async_hooks'

const tenantStorage = new AsyncLocalStorage<{ organizationId: string }>()

export async function runWithOrganization<T>(organizationId: string, fn: () => Promise<T> | T): Promise<T> {
  return tenantStorage.run({ organizationId }, async () => {
    return await fn()
  })
}

export function getCurrentOrganizationId(): string {
  const store = tenantStorage.getStore()
  if (!store) {
    throw new Error('No tenant context: getCurrentOrganizationId() called outside runWithOrganization()')
  }
  return store.organizationId
}

export function tryGetCurrentOrganizationId(): string | undefined {
  return tenantStorage.getStore()?.organizationId
}
