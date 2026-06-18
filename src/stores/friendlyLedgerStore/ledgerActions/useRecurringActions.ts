import { useCallback } from 'react'
import {
  AddLedgerRecurringItemCommand,
  DeleteLedgerRecurringItemCommand,
  UpdateLedgerRecurringItemCommand
} from '../../../data/ledger/requests'
import {
  withAddedRecurringItem,
  withDeletedRecurringItem,
  withUpdatedRecurringItem
} from '../ledgerStateUpdates'
import type { RecurringInput } from '../../../types/ledger'
import type { ActiveGroupActionDeps } from './types'

export const useRecurringActions = ({ activeGroup, runLedgerAction }: ActiveGroupActionDeps) => {
  const addRecurringItemToGroup = useCallback((groupId: string, input: RecurringInput) => {
    if (!groupId || input.amountCents === 0) {
      return
    }

    return runLedgerAction(new AddLedgerRecurringItemCommand({ groupId, input }), withAddedRecurringItem)
  }, [runLedgerAction])

  const addRecurringItem = useCallback((input: RecurringInput) => {
    if (activeGroup) {
      return addRecurringItemToGroup(activeGroup.id, input)
    }
  }, [activeGroup, addRecurringItemToGroup])

  const updateRecurringItemInGroup = useCallback((groupId: string, itemId: string, input: RecurringInput) => {
    if (!groupId || !itemId || input.amountCents === 0) {
      return
    }

    return runLedgerAction(new UpdateLedgerRecurringItemCommand({ groupId, itemId, input }), withUpdatedRecurringItem)
  }, [runLedgerAction])

  const updateRecurringItem = useCallback((itemId: string, input: RecurringInput) => {
    if (activeGroup) {
      return updateRecurringItemInGroup(activeGroup.id, itemId, input)
    }
  }, [activeGroup, updateRecurringItemInGroup])

  const deleteRecurringItemFromGroup = useCallback((groupId: string, itemId: string) => {
    if (!groupId) {
      return
    }

    return runLedgerAction(new DeleteLedgerRecurringItemCommand({ groupId, itemId }), withDeletedRecurringItem)
  }, [runLedgerAction])

  const deleteRecurringItem = useCallback((itemId: string) => {
    if (activeGroup) {
      return deleteRecurringItemFromGroup(activeGroup.id, itemId)
    }
  }, [activeGroup, deleteRecurringItemFromGroup])

  return {
    addRecurringItem,
    addRecurringItemToGroup,
    deleteRecurringItem,
    deleteRecurringItemFromGroup,
    updateRecurringItem,
    updateRecurringItemInGroup
  }
}
