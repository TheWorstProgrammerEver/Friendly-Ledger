import type {
  EntryInput,
  EntryShortcut,
  FriendlyLedgerState,
  Group,
  Invitation,
  LedgerEntry,
  Member,
  RecurringInput,
  EntryShortcutInput,
  RecurringItem
} from '../../types/ledger'
import { createCommandType, createQueryType } from '../../../lib/dispatch/dispatch'
import { ledgerRequestIdentifiers } from '../../../common/ledgerRequestIdentifiers'

export type LoadLedgerParams = {
  activeGroupId?: string
}

export type CreateLedgerGroupParams = {
  name: string
  inviteEmails: string[]
}

export type GroupIdParams = {
  groupId: string
}

export type InviteLedgerMemberParams = GroupIdParams & {
  email: string
}

export type AcceptLedgerInvitationParams = {
  invitationId: string
}

export type RejectLedgerInvitationParams = AcceptLedgerInvitationParams

export type LedgerEntryParams = GroupIdParams & {
  input: EntryInput
}

export type DeleteLedgerEntryParams = GroupIdParams & {
  entryId: string
}

export type LedgerEntryShortcutParams = GroupIdParams & {
  input: EntryShortcutInput
}

export type DeleteLedgerEntryShortcutParams = GroupIdParams & {
  shortcutId: string
}

export type LedgerRecurringItemParams = GroupIdParams & {
  input: RecurringInput
}

export type UpdateLedgerRecurringItemParams = LedgerRecurringItemParams & {
  itemId: string
}

export type DeleteLedgerRecurringItemParams = GroupIdParams & {
  itemId: string
}

export type CreateLedgerGroupResult = {
  group: Group
}

export type InviteLedgerMemberResult = {
  groupId: string
  member: Member
  invitation: Invitation
}

export type AcceptLedgerInvitationResult = {
  groupId: string
  member: Member
  invitationId: string
}

export type RejectLedgerInvitationResult = {
  groupId: string
  invitationId: string
}

export type DeleteLedgerEntryResult = {
  groupId: string
  entryId: string
}

export type DeleteLedgerEntryShortcutResult = {
  groupId: string
  shortcutId: string
}

export type DeleteLedgerRecurringItemResult = {
  groupId: string
  itemId: string
}

export const LoadLedgerQuery = createQueryType(ledgerRequestIdentifiers.load)<FriendlyLedgerState, LoadLedgerParams>()
export const CreateLedgerGroupCommand = createCommandType(ledgerRequestIdentifiers.createGroup)<CreateLedgerGroupResult, CreateLedgerGroupParams>()
export const InviteLedgerMemberCommand = createCommandType(ledgerRequestIdentifiers.inviteMember)<InviteLedgerMemberResult, InviteLedgerMemberParams>()
export const AcceptLedgerInvitationCommand = createCommandType(ledgerRequestIdentifiers.acceptInvitation)<AcceptLedgerInvitationResult, AcceptLedgerInvitationParams>()
export const RejectLedgerInvitationCommand = createCommandType(ledgerRequestIdentifiers.rejectInvitation)<RejectLedgerInvitationResult, RejectLedgerInvitationParams>()
export const AddLedgerEntryCommand = createCommandType(ledgerRequestIdentifiers.addEntry)<LedgerEntry, LedgerEntryParams>()
export const DeleteLedgerEntryCommand = createCommandType(ledgerRequestIdentifiers.deleteEntry)<DeleteLedgerEntryResult, DeleteLedgerEntryParams>()
export const AddLedgerEntryShortcutCommand = createCommandType(ledgerRequestIdentifiers.addEntryShortcut)<EntryShortcut, LedgerEntryShortcutParams>()
export const DeleteLedgerEntryShortcutCommand = createCommandType(ledgerRequestIdentifiers.deleteEntryShortcut)<DeleteLedgerEntryShortcutResult, DeleteLedgerEntryShortcutParams>()
export const AddLedgerRecurringItemCommand = createCommandType(ledgerRequestIdentifiers.addRecurringItem)<RecurringItem, LedgerRecurringItemParams>()
export const UpdateLedgerRecurringItemCommand = createCommandType(ledgerRequestIdentifiers.updateRecurringItem)<RecurringItem, UpdateLedgerRecurringItemParams>()
export const DeleteLedgerRecurringItemCommand = createCommandType(ledgerRequestIdentifiers.deleteRecurringItem)<DeleteLedgerRecurringItemResult, DeleteLedgerRecurringItemParams>()

export const ledgerRequestTypes = [
  LoadLedgerQuery,
  CreateLedgerGroupCommand,
  InviteLedgerMemberCommand,
  AcceptLedgerInvitationCommand,
  RejectLedgerInvitationCommand,
  AddLedgerEntryCommand,
  DeleteLedgerEntryCommand,
  AddLedgerEntryShortcutCommand,
  DeleteLedgerEntryShortcutCommand,
  AddLedgerRecurringItemCommand,
  UpdateLedgerRecurringItemCommand,
  DeleteLedgerRecurringItemCommand
]
