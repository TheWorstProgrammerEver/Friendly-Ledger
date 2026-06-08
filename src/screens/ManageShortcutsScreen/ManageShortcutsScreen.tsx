import { Link, Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../components/AppDialog/AppDialog'
import { EntryShortcutForm } from '../../components/EntryShortcutForm/EntryShortcutForm'
import { HeaderWithActions } from '../../components/HeaderWithActions/HeaderWithActions'
import { Section } from '../../components/Section/Section'
import { useConfirmation } from '../../hooks/useConfirmation'
import { useManageShortcutsScreenViewModel } from './useManageShortcutsScreenViewModel'
import styles from './ManageShortcutsScreen.module.scss'

export const ManageShortcutsScreen = () => {
  const viewModel = useManageShortcutsScreenViewModel()
  const confirmDeleteShortcut = useConfirmation('Delete this shortcut?')

  if (viewModel.shouldRedirect || !viewModel.group) {
    return <Navigate to="/groups/manage" replace />
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
            <Link className={styles.secondaryLink} to={`/groups/${viewModel.group.id}`}>Back to group</Link>
            <button type="button" onClick={viewModel.openAddDialog}>Add shortcut</button>
          </>
        )}
      />

      <Section ariaLabel="Manage shortcuts">
        {viewModel.shortcuts.length > 0 ? (
          <ul className={styles.list}>
            {viewModel.shortcuts.map((shortcut) => (
              <li key={shortcut.id}>
                <span className={styles.emoji} aria-hidden="true">{shortcut.emoji ?? '⚡'}</span>
                <span className={styles.details}>
                  <strong>{shortcut.label}</strong>
                  <small>
                    {shortcut.effect === 'positive' ? 'Positive' : 'Negative'} / {shortcut.category}
                  </small>
                </span>
                <button
                  type="button"
                  onClick={() => confirmDeleteShortcut(() => viewModel.deleteShortcut(shortcut.id))}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No shortcuts yet</p>
        )}
      </Section>

      <AppDialog
        open={viewModel.dialog === 'shortcut'}
        title="Add shortcut"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <button type="submit" form={viewModel.shortcutFormId}>Save shortcut</button>
          </DialogFooterActions>
        )}
      >
        <EntryShortcutForm formId={viewModel.shortcutFormId} onSave={viewModel.addShortcut} />
      </AppDialog>
    </section>
  )
}
