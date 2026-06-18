import { useCallback } from 'react'
import {
  AddLedgerEntryCommand,
  DeleteLedgerEntryCommand
} from '../../../data/ledger/requests'
import { withAddedEntry, withDeletedEntry } from '../ledgerStateUpdates'
import type { EntryInput } from '../../../types/ledger'
import type { ActiveGroupActionDeps } from './types'

export const useEntryActions = ({ activeGroup, runLedgerAction }: ActiveGroupActionDeps) => {
  const addEntryToGroup = useCallback((groupId: string, input: EntryInput) => {
    if (!groupId || input.amountCents === 0) {
      return
    }

    return runLedgerAction(new AddLedgerEntryCommand({ groupId, input }), withAddedEntry)
  }, [runLedgerAction])

  const addEntry = useCallback((input: EntryInput) => {
    if (activeGroup) {
      return addEntryToGroup(activeGroup.id, input)
    }
  }, [activeGroup, addEntryToGroup])

  const deleteEntryFromGroup = useCallback((groupId: string, entryId: string) => {
    if (!groupId) {
      return
    }

    return runLedgerAction(new DeleteLedgerEntryCommand({ groupId, entryId }), withDeletedEntry)
  }, [runLedgerAction])

  const deleteEntry = useCallback((entryId: string) => {
    if (activeGroup) {
      return deleteEntryFromGroup(activeGroup.id, entryId)
    }
  }, [activeGroup, deleteEntryFromGroup])

  return {
    addEntry,
    addEntryToGroup,
    deleteEntry,
    deleteEntryFromGroup
  }
}
