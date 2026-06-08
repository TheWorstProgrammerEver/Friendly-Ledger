import { useCallback, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { AsOfValue } from '../../components/AsOfControl/AsOfControl'
import type { EntryFormInitialValue, EntryFormInput } from '../../components/EntryForm/EntryForm'
import type { RecurringFormInput } from '../../components/RecurringForm/RecurringForm'
import { fromLocalIsoDate, todayIso, toLocalIsoDate } from '../../domain/date'
import { getGroupBalance } from '../../domain/ledger'
import { getEffectiveLedgerEntries } from '../../domain/recurrence'
import { useLedger } from '../../state/LedgerContext'

const addRecurringFormId = 'add-recurring-form'
const editRecurringFormId = 'edit-recurring-form'
const entryFormId = 'entry-form'
const inviteMemberFormId = 'invite-member-form'
const shortcutEntryFormId = 'shortcut-entry-form'

export const useGroupSummaryScreenViewModel = () => {
  const { groupId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const ledger = useLedger()
  const { selectGroup } = ledger
  const group = ledger.state.groups.find((candidate) => candidate.id === groupId)
  const dialog = searchParams.get('dialog')
  const recurringId = searchParams.get('recurringId')
  const shortcutId = searchParams.get('shortcutId')
  const shortcutExpanded = searchParams.get('shortcutExpanded') === 'true'
  const rawAsOfDate = searchParams.get('asOf')
  const currentDate = fromLocalIsoDate(todayIso())
  const todayDate = toLocalIsoDate(currentDate)
  const asOfValue: AsOfValue = rawAsOfDate ? fromLocalIsoDate(rawAsOfDate.slice(0, 10)) : 'Now'
  const asOfDate = asOfValue === 'Now' ? toLocalIsoDate(currentDate) : toLocalIsoDate(asOfValue)
  const selectedRecurringItem = group?.recurringItems.find((item) => item.id === recurringId)
  const shortcuts = group?.entryShortcuts ?? []
  const selectedShortcut = shortcuts.find((shortcut) => shortcut.id === shortcutId)
  const shortcutEntryInitialValue: EntryFormInitialValue | undefined = selectedShortcut
    ? {
      date: todayDate,
      description: selectedShortcut.description,
      category: selectedShortcut.category,
      effect: selectedShortcut.effect
    }
    : undefined

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId)
    }
  }, [groupId, selectGroup])

  useEffect(() => {
    if (rawAsOfDate && rawAsOfDate !== asOfDate) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('asOf', asOfDate)
      setSearchParams(nextParams, { replace: true })
    }
  }, [asOfDate, rawAsOfDate, searchParams, setSearchParams])

  const entries = useMemo(
    () => group ? getEffectiveLedgerEntries(group, asOfDate) : [],
    [asOfDate, group]
  )
  const balance = useMemo(
    () => group ? getGroupBalance(group, asOfDate) : { balanceCents: 0 },
    [asOfDate, group]
  )

  const updateSearchParams = useCallback((updates: Record<string, string | undefined>, replace = false) => {
    const nextParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      } else {
        nextParams.delete(key)
      }
    })

    setSearchParams(nextParams, { replace })
  }, [searchParams, setSearchParams])

  const closeDialog = useCallback(() => {
    updateSearchParams({
      dialog: undefined,
      recurringId: undefined,
      shortcutExpanded: undefined,
      shortcutId: undefined
    }, true)
  }, [updateSearchParams])

  const addEntry = useCallback((input: EntryFormInput) => {
    if (!group) {
      return
    }

    ledger.addEntryToGroup(group.id, input)
    closeDialog()
  }, [closeDialog, group, ledger])

  const addRecurringItem = useCallback((input: RecurringFormInput) => {
    if (!group) {
      return
    }

    ledger.addRecurringItemToGroup(group.id, input)
    closeDialog()
  }, [closeDialog, group, ledger])

  const deleteEntry = useCallback((entryId: string) => {
    if (group) {
      ledger.deleteEntryFromGroup(group.id, entryId)
    }
  }, [group, ledger])

  const deleteSelectedRecurringItem = useCallback(() => {
    if (!group || !selectedRecurringItem) {
      return
    }

    ledger.deleteRecurringItemFromGroup(group.id, selectedRecurringItem.id)
    closeDialog()
  }, [closeDialog, group, ledger, selectedRecurringItem])

  const inviteMember = useCallback((email: string) => {
    if (group) {
      ledger.inviteMemberToGroup(group.id, email)
      closeDialog()
    }
  }, [closeDialog, group, ledger])

  const updateSelectedRecurringItem = useCallback((input: RecurringFormInput) => {
    if (!group || !selectedRecurringItem) {
      return
    }

    ledger.updateRecurringItemInGroup(group.id, selectedRecurringItem.id, input)
    closeDialog()
  }, [closeDialog, group, ledger, selectedRecurringItem])

  const setAsOfValue = useCallback((value: AsOfValue) => {
    updateSearchParams({ asOf: value === 'Now' ? undefined : toLocalIsoDate(value) }, true)
  }, [updateSearchParams])

  return {
    addEntry,
    addRecurringItem,
    addRecurringFormId,
    asOfDate,
    asOfValue,
    balance,
    closeDialog,
    deleteEntry,
    deleteSelectedRecurringItem,
    dialog,
    editRecurringFormId,
    entryFormId,
    entries,
    group,
    inviteMember,
    currentDate,
    inviteMemberFormId,
    shortcutEntryFormId,
    shortcutEntryInitialValue,
    shortcutExpanded,
    shortcuts,
    openAddEntryDialog: () => updateSearchParams({ dialog: 'entry' }),
    openAddRecurringDialog: () => updateSearchParams({ dialog: 'recurring' }),
    openInviteDialog: () => updateSearchParams({ dialog: 'invite' }),
    openEditRecurringDialog: (itemId: string) => updateSearchParams({ dialog: 'edit-recurring', recurringId: itemId }),
    openShortcutEntryDialog: (itemId: string) => updateSearchParams({
      dialog: 'shortcut-entry',
      shortcutExpanded: undefined,
      shortcutId: itemId
    }),
    expandShortcutEntryDialog: () => updateSearchParams({ shortcutExpanded: 'true' }),
    selectedRecurringItem,
    selectedShortcut,
    setAsOfValue,
    shouldRedirect: !groupId || !group || !ledger.currentAccount,
    todayDate,
    updateSelectedRecurringItem
  }
}
