import type {
  EntryShortcut,
  FriendlyLedgerState,
  Group,
  LedgerEntry,
  RecurringItem
} from '../../types/ledger'
import type {
  AcceptLedgerInvitationResult,
  CreateLedgerGroupResult,
  DeleteLedgerEntryResult,
  DeleteLedgerEntryShortcutResult,
  DeleteLedgerRecurringItemResult,
  InviteLedgerMemberResult,
  RejectLedgerInvitationResult
} from '../../data/ledger/requests'

export type LedgerStateProjection<TResult> = (
  state: FriendlyLedgerState,
  result: TResult
) => FriendlyLedgerState

const replaceOrAppend = <TItem extends { id: string }>(items: TItem[], item: TItem) => (
  items.some((candidate) => candidate.id === item.id)
    ? items.map((candidate) => candidate.id === item.id ? item : candidate)
    : [...items, item]
)

const replaceOrPrepend = <TItem extends { id: string }>(items: TItem[], item: TItem) => (
  items.some((candidate) => candidate.id === item.id)
    ? items.map((candidate) => candidate.id === item.id ? item : candidate)
    : [item, ...items]
)

const sortGroups = (groups: Group[]) => [...groups].sort((left, right) => (
  left.createdDate.localeCompare(right.createdDate) || left.name.localeCompare(right.name)
))

const sortShortcuts = (shortcuts: EntryShortcut[]) => [...shortcuts].sort((left, right) => (
  left.label.localeCompare(right.label)
))

const sortRecurringItems = (items: RecurringItem[]) => [...items].sort((left, right) => (
  right.startDate.localeCompare(left.startDate) || left.title.localeCompare(right.title)
))

const sortEntries = (entries: LedgerEntry[]) => [...entries].sort((left, right) => (
  right.date.localeCompare(left.date) || right.createdDate.localeCompare(left.createdDate)
))

const updateGroup = (
  state: FriendlyLedgerState,
  groupId: string,
  update: (group: Group) => Group
) => ({
  ...state,
  groups: state.groups.map((group) => group.id === groupId ? update(group) : group)
})

export const withCreatedGroup: LedgerStateProjection<CreateLedgerGroupResult> = (state, result) => ({
  ...state,
  activeGroupId: result.group.id,
  groups: sortGroups(replaceOrAppend(state.groups, result.group))
})

export const withInvitedMember: LedgerStateProjection<InviteLedgerMemberResult> = (state, result) => (
  updateGroup(state, result.groupId, (group) => ({
    ...group,
    members: replaceOrAppend(group.members, result.member),
    invitations: replaceOrAppend(group.invitations, result.invitation)
  }))
)

const withoutPendingInvitation = (state: FriendlyLedgerState, invitationId: string) => ({
  ...state,
  pendingInvitations: state.pendingInvitations.filter((invitation) => invitation.id !== invitationId)
})

export const withAcceptedInvitation: LedgerStateProjection<AcceptLedgerInvitationResult> = (state, result) => ({
  ...withoutPendingInvitation(state, result.invitationId),
  activeGroupId: result.groupId
})

export const withRejectedInvitation: LedgerStateProjection<RejectLedgerInvitationResult> = (state, result) => (
  withoutPendingInvitation(state, result.invitationId)
)

export const withAddedEntry: LedgerStateProjection<LedgerEntry> = (state, entry) => (
  updateGroup(state, entry.groupId, (group) => ({
    ...group,
    entries: sortEntries(replaceOrPrepend(group.entries, entry))
  }))
)

export const withDeletedEntry: LedgerStateProjection<DeleteLedgerEntryResult> = (state, result) => (
  updateGroup(state, result.groupId, (group) => ({
    ...group,
    entries: group.entries.filter((entry) => entry.id !== result.entryId)
  }))
)

export const withAddedEntryShortcut: LedgerStateProjection<EntryShortcut> = (state, shortcut) => (
  updateGroup(state, shortcut.groupId, (group) => ({
    ...group,
    entryShortcuts: sortShortcuts(replaceOrAppend(group.entryShortcuts ?? [], shortcut))
  }))
)

export const withDeletedEntryShortcut: LedgerStateProjection<DeleteLedgerEntryShortcutResult> = (state, result) => (
  updateGroup(state, result.groupId, (group) => ({
    ...group,
    entryShortcuts: (group.entryShortcuts ?? []).filter((shortcut) => shortcut.id !== result.shortcutId)
  }))
)

export const withAddedRecurringItem: LedgerStateProjection<RecurringItem> = (state, item) => (
  updateGroup(state, item.groupId, (group) => ({
    ...group,
    recurringItems: sortRecurringItems(replaceOrAppend(group.recurringItems, item))
  }))
)

export const withUpdatedRecurringItem = withAddedRecurringItem

export const withDeletedRecurringItem: LedgerStateProjection<DeleteLedgerRecurringItemResult> = (state, result) => (
  updateGroup(state, result.groupId, (group) => ({
    ...group,
    recurringItems: group.recurringItems.filter((item) => item.id !== result.itemId)
  }))
)
