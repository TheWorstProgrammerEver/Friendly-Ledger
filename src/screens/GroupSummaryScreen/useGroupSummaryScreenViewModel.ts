import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { AsOfValue } from '../../components/AsOfControl/AsOfControl'
import type { EntryFormInitialValue, EntryFormInput } from '../../components/EntryForm/EntryForm'
import { fromLocalIsoDate, todayIso, toLocalIsoDate } from '../../domain/date'
import { getGroupBalance } from '../../domain/ledger'
import { getEffectiveLedgerEntries } from '../../domain/recurrence'
import { useLoader } from '../../../lib/hooks/useLoader'
import { useLedgerContext } from '../../contexts/LedgerContext'

const entryFormId = 'entry-form'
const inviteMemberFormId = 'invite-member-form'
const shortcutEntryFormId = 'shortcut-entry-form'
const viewModeStoragePrefix = 'friendly-ledger:group-summary-view-mode'

export type GroupSummaryViewMode = 'compact' | 'expanded'

const readViewMode = (accountId?: string): GroupSummaryViewMode => {
  if (!accountId || typeof window === 'undefined') {
    return 'expanded'
  }

  const value = window.localStorage.getItem(`${viewModeStoragePrefix}:${accountId}`)

  return value === 'compact' ? 'compact' : 'expanded'
}

export const useGroupSummaryScreenViewModel = () => {
  const { groupId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const ledger = useLedgerContext()
  const addEntryLoader = useLoader()
  const inviteMemberLoader = useLoader()
  const shortcutEntryLoader = useLoader()
  const { selectGroup } = ledger
  const currentAccountId = ledger.currentAccount?.id
  const [viewMode, setViewMode] = useState<GroupSummaryViewMode>(() => readViewMode(currentAccountId))
  const group = ledger.state.groups.find((candidate) => candidate.id === groupId)
  const dialog = searchParams.get('dialog')
  const shortcutId = searchParams.get('shortcutId')
  const shortcutExpanded = searchParams.get('shortcutExpanded') === 'true'
  const rawAsOfDate = searchParams.get('asOf')
  const currentDate = fromLocalIsoDate(todayIso())
  const todayDate = toLocalIsoDate(currentDate)
  const asOfValue: AsOfValue = rawAsOfDate ? fromLocalIsoDate(rawAsOfDate.slice(0, 10)) : 'Now'
  const asOfDate = asOfValue === 'Now' ? toLocalIsoDate(currentDate) : toLocalIsoDate(asOfValue)
  const shortcuts = group?.entryShortcuts ?? []
  const selectedShortcut = shortcuts.find((shortcut) => shortcut.id === shortcutId)
  const shortcutEntryInitialValue: EntryFormInitialValue | undefined = selectedShortcut
    ? {
      date: todayDate,
      description: selectedShortcut.description,
      category: selectedShortcut.category,
      effect: selectedShortcut.effect,
      amountCents: selectedShortcut.defaultAmountCents
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
      shortcutExpanded: undefined,
      shortcutId: undefined
    }, true)
  }, [updateSearchParams])

  const addEntry = useCallback(async (input: EntryFormInput) => {
    await addEntryLoader.execute(async () => {
      if (!group) {
        return
      }

      const entry = await ledger.addEntryToGroup(group.id, input)

      if (entry) {
        closeDialog()
      }
    })
  }, [addEntryLoader, closeDialog, group, ledger])

  const addShortcutEntry = useCallback(async (input: EntryFormInput) => {
    await shortcutEntryLoader.execute(async () => {
      if (!group) {
        return
      }

      const entry = await ledger.addEntryToGroup(group.id, input)

      if (entry) {
        closeDialog()
      }
    })
  }, [closeDialog, group, ledger, shortcutEntryLoader])

  const deleteEntry = useCallback(async (entryId: string) => {
    if (group) {
      await ledger.deleteEntryFromGroup(group.id, entryId)
    }
  }, [group, ledger])

  const inviteMember = useCallback(async (email: string) => {
    await inviteMemberLoader.execute(async () => {
      if (!group) {
        return
      }

      const result = await ledger.inviteMemberToGroup(group.id, email)

      if (result) {
        closeDialog()
      }
    })
  }, [closeDialog, group, inviteMemberLoader, ledger])

  const setAsOfValue = useCallback((value: AsOfValue) => {
    updateSearchParams({ asOf: value === 'Now' ? undefined : toLocalIsoDate(value) }, true)
  }, [updateSearchParams])

  const toggleViewMode = useCallback(() => {
    setViewMode((current) => {
      const next = current === 'expanded' ? 'compact' : 'expanded'

      if (currentAccountId) {
        window.localStorage.setItem(`${viewModeStoragePrefix}:${currentAccountId}`, next)
      }

      return next
    })
  }, [currentAccountId])

  return {
    addEntry,
    addEntryLoader,
    addShortcutEntry,
    asOfDate,
    asOfValue,
    balance,
    closeDialog,
    deleteEntry,
    dialog,
    entryFormId,
    entries,
    group,
    inviteMember,
    inviteMemberLoader,
    currentDate,
    inviteMemberFormId,
    ledgerLoad: ledger.ledgerLoad,
    shortcutEntryFormId,
    shortcutEntryInitialValue,
    shortcutEntryLoader,
    shortcutExpanded,
    shortcuts,
    openAddEntryDialog: () => updateSearchParams({ dialog: 'entry' }),
    openInviteDialog: () => updateSearchParams({ dialog: 'invite' }),
    openShortcutEntryDialog: (itemId: string) => updateSearchParams({
      dialog: 'shortcut-entry',
      shortcutExpanded: undefined,
      shortcutId: itemId
    }),
    expandShortcutEntryDialog: () => updateSearchParams({ shortcutExpanded: 'true' }),
    selectedShortcut,
    setAsOfValue,
    shouldRedirect: ledger.ledgerLoad.settled && (!groupId || !group || !ledger.currentAccount),
    todayDate,
    toggleViewMode,
    viewMode
  }
}
