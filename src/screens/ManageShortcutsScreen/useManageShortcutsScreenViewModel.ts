import { useCallback, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { EntryShortcutFormInput } from '../../components/EntryShortcutForm/EntryShortcutForm'
import { useLoader } from '../../../lib/hooks/useLoader'
import { useLedgerContext } from '../../contexts/LedgerContext'
import type { EntryShortcut } from '../../types/ledger'

const shortcutFormId = 'shortcut-form'

const byLabel = (left: EntryShortcut, right: EntryShortcut) => (
  left.label.localeCompare(right.label, undefined, { sensitivity: 'base' })
)

export const useManageShortcutsScreenViewModel = () => {
  const { groupId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const ledger = useLedgerContext()
  const addShortcutLoader = useLoader()
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

  const addShortcut = useCallback(async (input: EntryShortcutFormInput) => {
    await addShortcutLoader.execute(async () => {
      if (!group) {
        return
      }

      const shortcut = await ledger.addEntryShortcutToGroup(group.id, input)

      if (shortcut) {
        closeDialog()
      }
    })
  }, [addShortcutLoader, closeDialog, group, ledger])

  const deleteShortcut = useCallback(async (shortcutId: string) => {
    if (group) {
      await ledger.deleteEntryShortcutFromGroup(group.id, shortcutId)
    }
  }, [group, ledger])

  return {
    addShortcut,
    addShortcutLoader,
    closeDialog,
    deleteShortcut,
    dialog,
    group,
    groupId,
    ledgerLoad: ledger.ledgerLoad,
    openAddDialog,
    shortcutFormId,
    shortcuts,
    shouldRedirect: ledger.ledgerLoad.settled && (!groupId || !group || !ledger.currentAccount)
  }
}
