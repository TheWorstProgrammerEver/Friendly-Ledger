import { useCallback, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { EntryShortcutFormInput } from '../../components/EntryShortcutForm/EntryShortcutForm'
import { useLedger } from '../../state/LedgerContext'
import type { EntryShortcut } from '../../types'

const shortcutFormId = 'shortcut-form'

const byLabel = (left: EntryShortcut, right: EntryShortcut) => (
  left.label.localeCompare(right.label, undefined, { sensitivity: 'base' })
)

export const useManageShortcutsScreenViewModel = () => {
  const { groupId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const ledger = useLedger()
  const { selectGroup } = ledger
  const group = ledger.state.groups.find((candidate) => candidate.id === groupId)
  const dialog = searchParams.get('dialog')
  const shortcuts = useMemo(() => [...(group?.entryShortcuts ?? [])].sort(byLabel), [group?.entryShortcuts])

  useEffect(() => {
    if (groupId) {
      selectGroup(groupId)
    }
  }, [groupId, selectGroup])

  const openAddDialog = useCallback(() => {
    setSearchParams({ dialog: 'shortcut' })
  }, [setSearchParams])

  const closeDialog = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const addShortcut = useCallback((input: EntryShortcutFormInput) => {
    if (!group) {
      return
    }

    ledger.addEntryShortcutToGroup(group.id, input)
    closeDialog()
  }, [closeDialog, group, ledger])

  const deleteShortcut = useCallback((shortcutId: string) => {
    if (group) {
      ledger.deleteEntryShortcutFromGroup(group.id, shortcutId)
    }
  }, [group, ledger])

  return {
    addShortcut,
    closeDialog,
    deleteShortcut,
    dialog,
    group,
    groupId,
    openAddDialog,
    shortcutFormId,
    shortcuts,
    shouldRedirect: !groupId || !group || !ledger.currentAccount
  }
}
