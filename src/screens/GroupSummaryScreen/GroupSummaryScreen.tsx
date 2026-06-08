import { Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../components/AppDialog/AppDialog'
import { AsOfControl } from '../../components/AsOfControl/AsOfControl'
import { BalanceSummary } from '../../components/BalanceSummary/BalanceSummary'
import { EntryForm } from '../../components/EntryForm/EntryForm'
import { EntryShortcutForm } from '../../components/EntryShortcutForm/EntryShortcutForm'
import { EntryShortcuts } from '../../components/EntryShortcuts/EntryShortcuts'
import { HeaderWithActions } from '../../components/HeaderWithActions/HeaderWithActions'
import { InviteMemberForm } from '../../components/InviteMemberForm/InviteMemberForm'
import { LedgerTable } from '../../components/LedgerTable/LedgerTable'
import { AddRecurringForm, EditRecurringForm } from '../../components/RecurringForm/RecurringForm'
import { RecurringRules } from '../../components/RecurringRules/RecurringRules'
import { ShortcutEntryForm } from '../../components/ShortcutEntryForm/ShortcutEntryForm'
import { useConfirmation } from '../../hooks/useConfirmation'
import { useGroupSummaryScreenViewModel } from './useGroupSummaryScreenViewModel'
import styles from './GroupSummaryScreen.module.scss'

export const GroupSummaryScreen = () => {
  const viewModel = useGroupSummaryScreenViewModel()
  const { group, selectedRecurringItem, selectedShortcut } = viewModel
  const confirmDeleteShortcut = useConfirmation('Delete this shortcut?')
  const confirmDeleteRecurring = useConfirmation('Delete this recurring rule?')

  if (viewModel.shouldRedirect || !group) {
    return <Navigate to="/groups/manage" replace />
  }

  return (
    <section className={styles.screen} aria-labelledby="group-title">
      <HeaderWithActions
        className={styles.header}
        header={(
          <>
            <h2 id="group-title">{group.name}</h2>
            <p>{group.members.length} people</p>
          </>
        )}
        actions={(
          <>
            <button type="button" onClick={viewModel.openInviteDialog}>Invite</button>
            <button type="button" onClick={viewModel.openAddEntryDialog}>Add entry</button>
          </>
        )}
      />

      <BalanceSummary balanceCents={viewModel.balance.balanceCents} entryCount={viewModel.balance.entryCount} />

      <EntryShortcuts
        shortcuts={viewModel.shortcuts}
        onAdd={viewModel.openAddShortcutDialog}
        onDelete={(shortcutId) => confirmDeleteShortcut(() => viewModel.deleteEntryShortcut(shortcutId))}
        onUse={viewModel.openShortcutEntryDialog}
      />

      <RecurringRules
        group={group}
        onAdd={viewModel.openAddRecurringDialog}
        onEdit={viewModel.openEditRecurringDialog}
      />

      <LedgerTable
        actions={(
          <AsOfControl
            currentDate={viewModel.currentDate}
            value={viewModel.asOfValue}
            onChange={viewModel.setAsOfValue}
          />
        )}
        entries={viewModel.entries}
        onDeleteEntry={viewModel.deleteEntry}
      />

      <AppDialog
        open={viewModel.dialog === 'entry'}
        title="Add entry"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <button type="submit" form={viewModel.entryFormId}>Add entry</button>
          </DialogFooterActions>
        )}
      >
        <EntryForm
          formId={viewModel.entryFormId}
          today={viewModel.asOfDate}
          onAdd={viewModel.addEntry}
        />
      </AppDialog>

      <AppDialog
        open={viewModel.dialog === 'shortcut'}
        title="Add shortcut"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <button type="submit" form={viewModel.addShortcutFormId}>Save shortcut</button>
          </DialogFooterActions>
        )}
      >
        <EntryShortcutForm
          formId={viewModel.addShortcutFormId}
          onSave={viewModel.addEntryShortcut}
        />
      </AppDialog>

      <AppDialog
        open={viewModel.dialog === 'shortcut-entry' && Boolean(selectedShortcut)}
        title={selectedShortcut?.label ?? 'Shortcut entry'}
        onClose={viewModel.closeDialog}
        footer={selectedShortcut ? (
          <DialogFooterActions>
            <button type="submit" form={viewModel.shortcutEntryFormId}>Add entry</button>
            {!viewModel.shortcutExpanded ? (
              <button type="button" onClick={viewModel.expandShortcutEntryDialog}>Expand</button>
            ) : null}
          </DialogFooterActions>
        ) : undefined}
      >
        {selectedShortcut && !viewModel.shortcutExpanded ? (
          <ShortcutEntryForm
            key={selectedShortcut.id}
            formId={viewModel.shortcutEntryFormId}
            today={viewModel.todayDate}
            category={selectedShortcut.category}
            description={selectedShortcut.description}
            effect={selectedShortcut.effect}
            onAdd={viewModel.addEntry}
          />
        ) : null}

        {selectedShortcut && viewModel.shortcutExpanded && viewModel.shortcutEntryInitialValue ? (
          <EntryForm
            key={`${selectedShortcut.id}-expanded`}
            formId={viewModel.shortcutEntryFormId}
            today={viewModel.todayDate}
            initialValue={viewModel.shortcutEntryInitialValue}
            onAdd={viewModel.addEntry}
          />
        ) : null}
      </AppDialog>

      <AppDialog
        open={viewModel.dialog === 'invite'}
        title="Invite member"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <button type="submit" form={viewModel.inviteMemberFormId}>Invite</button>
          </DialogFooterActions>
        )}
      >
        <InviteMemberForm formId={viewModel.inviteMemberFormId} onInvite={viewModel.inviteMember} />
      </AppDialog>

      <AppDialog
        open={viewModel.dialog === 'recurring'}
        title="Add recurring"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <button type="submit" form={viewModel.addRecurringFormId}>Save recurring</button>
          </DialogFooterActions>
        )}
      >
        {viewModel.dialog === 'recurring' ? (
          <AddRecurringForm
            formId={viewModel.addRecurringFormId}
            today={viewModel.asOfDate}
            onSave={viewModel.addRecurringItem}
          />
        ) : null}
      </AppDialog>

      <AppDialog
        open={viewModel.dialog === 'edit-recurring' && Boolean(selectedRecurringItem)}
        title="Edit recurring"
        onClose={viewModel.closeDialog}
        footer={selectedRecurringItem ? (
          <DialogFooterActions>
            <button type="submit" form={viewModel.editRecurringFormId}>Save recurring</button>
            <button
              type="button"
              onClick={() => confirmDeleteRecurring(viewModel.deleteSelectedRecurringItem)}
            >
              Delete
            </button>
          </DialogFooterActions>
        ) : undefined}
      >
        {selectedRecurringItem ? (
          <EditRecurringForm
            key={selectedRecurringItem.id}
            formId={viewModel.editRecurringFormId}
            item={selectedRecurringItem}
            onSave={viewModel.updateSelectedRecurringItem}
          />
        ) : null}
      </AppDialog>
    </section>
  )
}
