import type { LedgerRequestIdentifier } from '../../../common/ledgerRequestIdentifiers'

export type GroupExpectation = {
  entryId: string
  groupId: string
  invitationId: string
  recurringId: string
  shortcutId: string
}

export type IdRow = {
  id: string
}

export type GroupScopedRow = IdRow & {
  group_id: string
}

export type ProfileRow = IdRow & {
  email: string
}

export type MemberRow = GroupScopedRow & {
  email: string
  name: string
  profile_id: string | null
  status: string
}

export type DirectMutationCase = {
  deleteId: string
  insertPayload: Record<string, unknown>
  insertedId: string
  table: string
  updatePayload: Record<string, unknown>
  verifyInsertBlocked: () => Promise<void>
  verifyTargetUnchanged: () => Promise<void>
}

export type FunctionMutationCase = {
  identifier: LedgerRequestIdentifier
  params: unknown
  shouldError: boolean
  verifyUnchanged: () => Promise<void>
}
