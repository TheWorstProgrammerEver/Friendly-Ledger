import { useCallback, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useLoader } from '../../../lib/hooks/useLoader'
import type { RecurringFormInput } from '../../components/RecurringForm/RecurringForm'
import { useLedgerContext } from '../../contexts/LedgerContext'
import { todayIso } from '../../domain/date'
import type { RecurringItem } from '../../types/ledger'

const addRecurringFormId = 'add-recurring-form'
const editRecurringFormId = 'edit-recurring-form'

const byTitle = (left: RecurringItem, right: RecurringItem) => (
  left.title.localeCompare(right.title, undefined, { sensitivity: 'base' })
)

export const useManageRecurringScreenViewModel = () => {
  const { groupId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const ledger = useLedgerContext()
  const addRecurringLoader = useLoader()
  const editRecurringLoader = useLoader()
  const { selectGroup } = ledger
  const group = ledger.state.groups.find((candidate) => candidate.id === groupId)
  const dialog = searchParams.get('dialog')
  const recurringId = searchParams.get('recurringId')
  const recurringItems = useMemo(() => [...(group?.recurringItems ?? [])].sort(byTitle), [group?.recurringItems])
  const selectedRecurringItem = recurringItems.find((item) => item.id === recurringId)

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId)
    }
  }, [groupId, selectGroup])

  const closeDialog = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const addRecurringItem = useCallback(async (input: RecurringFormInput) => {
    await addRecurringLoader.execute(async () => {
      if (!group) {
        return
      }

      const item = await ledger.addRecurringItemToGroup(group.id, input)

      if (item) {
        closeDialog()
      }
    })
  }, [addRecurringLoader, closeDialog, group, ledger])

  const updateSelectedRecurringItem = useCallback(async (input: RecurringFormInput) => {
    await editRecurringLoader.execute(async () => {
      if (!group || !selectedRecurringItem) {
        return
      }

      const item = await ledger.updateRecurringItemInGroup(group.id, selectedRecurringItem.id, input)

      if (item) {
        closeDialog()
      }
    })
  }, [closeDialog, editRecurringLoader, group, ledger, selectedRecurringItem])

  const deleteRecurringItem = useCallback(async (itemId: string) => {
    if (group) {
      await ledger.deleteRecurringItemFromGroup(group.id, itemId)
    }
  }, [group, ledger])

  return {
    addRecurringFormId,
    addRecurringItem,
    addRecurringLoader,
    closeDialog,
    deleteRecurringItem,
    dialog,
    editRecurringFormId,
    editRecurringLoader,
    group,
    ledgerLoad: ledger.ledgerLoad,
    openAddDialog: () => setSearchParams({ dialog: 'add' }),
    openEditDialog: (itemId: string) => setSearchParams({ dialog: 'edit', recurringId: itemId }),
    recurringItems,
    selectedRecurringItem,
    shouldRedirect: ledger.ledgerLoad.settled && (!groupId || !group || !ledger.currentAccount),
    today: todayIso(),
    updateSelectedRecurringItem
  }
}
