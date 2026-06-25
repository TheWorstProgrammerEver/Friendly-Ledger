import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { ActionLink } from '../../../lib/ui/Button/ActionLink'
import { Button } from '../../../lib/ui/Button/Button'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { EntryShortcutForm } from '../../components/EntryShortcutForm/EntryShortcutForm'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { List, ListItem } from '../../../lib/ui/List/List'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
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
        <section className={styles.screen} aria-label="Loading shortcuts" />
      </LoaderContainer>
    )
  }

  return (
    <section className={styles.screen} aria-labelledby="manage-shortcuts-title">
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
              <ActionLink to={`/groups/${viewModel.group.id}`}>
                <ResponsiveContent icon={<ArrowLeft />}>Back to group</ResponsiveContent>
              </ActionLink>
            </ComponentRoleContext>
            <ComponentRoleContext role="primary">
              <Button type="button" onClick={viewModel.openAddDialog}>
                <ResponsiveContent icon={<Plus />}>Add shortcut</ResponsiveContent>
              </Button>
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
                    <Button
                      type="button"
                      onClick={() => confirmDeleteShortcut(() => viewModel.deleteShortcut(shortcut.id))}
                    >
                      <ResponsiveContent icon={<Trash2 />}>Delete</ResponsiveContent>
                    </Button>
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
    </section>
  )
}
