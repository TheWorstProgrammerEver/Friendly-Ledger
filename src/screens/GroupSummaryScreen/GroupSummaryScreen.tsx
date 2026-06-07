import { Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../components/AppDialog/AppDialog'
import { AsOfControl } from '../../components/AsOfControl/AsOfControl'
import { BalanceSummary } from '../../components/BalanceSummary/BalanceSummary'
import { EntryForm } from '../../components/EntryForm/EntryForm'
import { InviteMemberForm } from '../../components/InviteMemberForm/InviteMemberForm'
import { LedgerTable } from '../../components/LedgerTable/LedgerTable'
import { AddRecurringForm, EditRecurringForm } from '../../components/RecurringForm/RecurringForm'
import { RecurringRules } from '../../components/RecurringRules/RecurringRules'
import { useGroupSummaryScreenViewModel } from './useGroupSummaryScreenViewModel'
import styles from './GroupSummaryScreen.module.scss'

export const GroupSummaryScreen = () => {
  const viewModel = useGroupSummaryScreenViewModel()
  const { group, selectedRecurringItem } = viewModel

  if (viewModel.shouldRedirect || !group) {
    return <Navigate to="/groups/manage" replace />
  }

  return (
    <section className={styles.screen} aria-labelledby="group-title">
      <header className={styles.header}>
        <div>
          <h2 id="group-title">{group.name}</h2>
          <p>{group.members.length} people</p>
        </div>
        <InviteMemberForm onInvite={viewModel.inviteMember} />
      </header>

      <div className={styles.actions}>
        <button type="button" onClick={viewModel.openAddEntryDialog}>Add entry</button>
        <AsOfControl
          value={viewModel.asOfDate}
          onChange={viewModel.setAsOfDate}
          onReset={viewModel.resetAsOfDate}
        />
      </div>

      <BalanceSummary balanceCents={viewModel.balance.balanceCents} entryCount={viewModel.balance.entryCount} />

      <RecurringRules
        group={group}
        onAdd={viewModel.openAddRecurringDialog}
        onEdit={viewModel.openEditRecurringDialog}
      />

      <LedgerTable
        entries={viewModel.entries}
        onDeleteEntry={viewModel.deleteEntry}
      />

      <AppDialog open={viewModel.dialog === 'entry'} title="Add entry" onClose={viewModel.closeDialog}>
        <EntryForm
          today={viewModel.asOfDate}
          onAdd={viewModel.addEntry}
        />
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
            <button type="button" onClick={viewModel.deleteSelectedRecurringItem}>Delete</button>
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
