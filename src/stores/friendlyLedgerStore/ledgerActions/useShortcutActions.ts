import { useCallback } from 'react'
import {
  AddLedgerEntryShortcutCommand,
  DeleteLedgerEntryShortcutCommand
} from '../../../data/ledger/requests'
import { withAddedEntryShortcut, withDeletedEntryShortcut } from '../ledgerStateUpdates'
import type { EntryShortcutInput } from '../../../types/ledger'
import type { ActiveGroupActionDeps } from './types'

export const useShortcutActions = ({ activeGroup, runLedgerAction }: ActiveGroupActionDeps) => {
  const addEntryShortcutToGroup = useCallback((groupId: string, input: EntryShortcutInput) => {
    if (!groupId) {
      return
    }

    return runLedgerAction(new AddLedgerEntryShortcutCommand({ groupId, input }), withAddedEntryShortcut)
  }, [runLedgerAction])

  const addEntryShortcut = useCallback((input: EntryShortcutInput) => {
    if (activeGroup) {
      return addEntryShortcutToGroup(activeGroup.id, input)
    }
  }, [activeGroup, addEntryShortcutToGroup])

  const deleteEntryShortcutFromGroup = useCallback((groupId: string, shortcutId: string) => {
    if (!groupId) {
      return
    }

    return runLedgerAction(new DeleteLedgerEntryShortcutCommand({ groupId, shortcutId }), withDeletedEntryShortcut)
  }, [runLedgerAction])

  const deleteEntryShortcut = useCallback((shortcutId: string) => {
    if (activeGroup) {
      return deleteEntryShortcutFromGroup(activeGroup.id, shortcutId)
    }
  }, [activeGroup, deleteEntryShortcutFromGroup])

  return {
    addEntryShortcut,
    addEntryShortcutToGroup,
    deleteEntryShortcut,
    deleteEntryShortcutFromGroup
  }
}
