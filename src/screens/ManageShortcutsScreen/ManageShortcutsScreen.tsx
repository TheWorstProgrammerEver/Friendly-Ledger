import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { EntryShortcutForm } from '../../components/EntryShortcutForm/EntryShortcutForm'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { List, ListItem } from '../../../lib/ui/List/List'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { ResponsiveActionLink } from '../../../lib/ui/ResponsiveActionLink/ResponsiveActionLink'
import { ResponsiveButton } from '../../../lib/ui/ResponsiveButton/ResponsiveButton'
import { Screen } from '../../components/Screen/Screen'
import { formatMoney } from '../../domain/money'
import { useConfirmation } from '../../../lib/hooks/useConfirmation'
import { useManageShortcutsScreenViewModel } from './useManageShortcutsScreenViewModel'
import styles from './ManageShortcutsScreen.module.scss'

export const ManageShortcutsScreen = () => {
  const viewModel = useManageShortcutsScreenViewModel()
  const confirmDeleteShortcut = useConfirmation('Delete this shortcut?')

  if (viewModel.shouldRedirect) {
    return <Navigate to="/groups/manage" replace />
  }

  if (!viewModel.group) {
    return (
      <LoaderContainer loader={viewModel.ledgerLoad} loadingLabel="Loading ledger...">
        <Screen aria-label="Loading shortcuts" />
      </LoaderContainer>
    )
  }

  return (
    <Screen className={styles.content} aria-labelledby="manage-shortcuts-title">
      <HeaderWithActions
        header={(
          <>
            <h2 id="manage-shortcuts-title">Shortcuts</h2>
            <p>{viewModel.group.name}</p>
          </>
        )}
        actions={(
          <>
            <ComponentRoleContext role="tertiary">
              <ResponsiveActionLink
                to={`/groups/${viewModel.group.id}`}
                icon={<ArrowLeft />}
                label="Back to group"
              />
            </ComponentRoleContext>
            <ComponentRoleContext role="primary">
              <ResponsiveButton
                type="button"
                icon={<Plus />}
                label="Add shortcut"
                onClick={viewModel.openAddDialog}
              />
            </ComponentRoleContext>
          </>
        )}
      />

      <section aria-label="Manage shortcuts">
        {viewModel.shortcuts.length > 0 ? (
          <List>
            {viewModel.shortcuts.map((shortcut) => (
              <ListItem
                key={shortcut.id}
                actionsLabel={`${shortcut.label} actions`}
                leading={<span className={styles.emoji} aria-hidden="true">{shortcut.emoji ?? '⚡'}</span>}
                details={(
                  <>
                    <strong>{shortcut.label}</strong>
                    <small>
                      {shortcut.effect === 'positive' ? 'Positive' : 'Negative'} / {shortcut.category}
                      {shortcut.defaultAmountCents ? ` / ${formatMoney(shortcut.defaultAmountCents)}` : ''}
                    </small>
                  </>
                )}
                actions={(
                  <ComponentRoleContext role="destructive">
                    <ResponsiveButton
                      type="button"
                      icon={<Trash2 />}
                      label="Delete"
                      onClick={() => confirmDeleteShortcut(() => viewModel.deleteShortcut(shortcut.id))}
                    />
                  </ComponentRoleContext>
                )}
              />
            ))}
          </List>
        ) : (
          <p>No shortcuts yet</p>
        )}
      </section>

      <AppDialog
        open={viewModel.dialog === 'shortcut'}
        title="Add shortcut"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <ComponentRoleContext role="primary">
              <AsynchronousSubmitButton
                form={viewModel.shortcutFormId}
                loader={viewModel.addShortcutLoader}
                statusLabel="Saving shortcut..."
              >
                Save shortcut
              </AsynchronousSubmitButton>
            </ComponentRoleContext>
          </DialogFooterActions>
        )}
      >
        <EntryShortcutForm formId={viewModel.shortcutFormId} onSave={viewModel.addShortcut} />
      </AppDialog>
    </Screen>
  )
}
