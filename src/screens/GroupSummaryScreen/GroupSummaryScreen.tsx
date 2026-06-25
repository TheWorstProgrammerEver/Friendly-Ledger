import { Maximize2, Plus, Trash2, UserPlus } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { Button } from '../../../lib/ui/Button/Button'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { AsOfControl } from '../../components/AsOfControl/AsOfControl'
import { BalanceSummary } from '../../components/BalanceSummary/BalanceSummary'
import { EntryForm } from '../../components/EntryForm/EntryForm'
import { EntryShortcuts } from '../../components/EntryShortcuts/EntryShortcuts'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { InviteMemberForm } from '../../components/InviteMemberForm/InviteMemberForm'
import { LedgerTable } from '../../components/LedgerTable/LedgerTable'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { AddRecurringForm, EditRecurringForm } from '../../components/RecurringForm/RecurringForm'
import { RecurringRules } from '../../components/RecurringRules/RecurringRules'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
import { ShortcutEntryForm } from '../../components/ShortcutEntryForm/ShortcutEntryForm'
import { useConfirmation } from '../../../lib/hooks/useConfirmation'
import { useGroupSummaryScreenViewModel } from './useGroupSummaryScreenViewModel'
import styles from './GroupSummaryScreen.module.scss'

export const GroupSummaryScreen = () => {
  const viewModel = useGroupSummaryScreenViewModel()
  const { group, selectedRecurringItem, selectedShortcut } = viewModel
  const confirmDeleteRecurring = useConfirmation('Delete this recurring rule?')

  if (viewModel.shouldRedirect) {
    return <Navigate to="/groups/manage" replace />
  }

  if (!group) {
    return (
      <LoaderContainer loader={viewModel.ledgerLoad} loadingLabel="Loading ledger...">
        <section className={styles.screen} aria-label="Loading group" />
      </LoaderContainer>
    )
  }

  return (
    <LoaderContainer loader={viewModel.ledgerLoad} loadingLabel="Loading ledger...">
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
              <Button type="button" onClick={viewModel.openInviteDialog}>
                <ResponsiveContent icon={<UserPlus />}>Invite</ResponsiveContent>
              </Button>
              <ComponentRoleContext role="primary">
                <Button type="button" onClick={viewModel.openAddEntryDialog}>
                  <ResponsiveContent icon={<Plus />}>Add entry</ResponsiveContent>
                </Button>
              </ComponentRoleContext>
            </>
          )}
        />

        <BalanceSummary balanceCents={viewModel.balance.balanceCents} />

        <EntryShortcuts
          manageHref={`/groups/${group.id}/shortcuts`}
          shortcuts={viewModel.shortcuts}
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
              <ComponentRoleContext role="primary">
                <AsynchronousSubmitButton
                  form={viewModel.entryFormId}
                  loader={viewModel.addEntryLoader}
                  statusLabel="Adding entry..."
                >
                  Add entry
                </AsynchronousSubmitButton>
              </ComponentRoleContext>
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
          open={viewModel.dialog === 'shortcut-entry' && Boolean(selectedShortcut)}
          title={selectedShortcut?.label ?? 'Shortcut entry'}
          onClose={viewModel.closeDialog}
          footer={selectedShortcut && (
            <DialogFooterActions>
              <ComponentRoleContext role="primary">
                <AsynchronousSubmitButton
                  form={viewModel.shortcutEntryFormId}
                  loader={viewModel.shortcutEntryLoader}
                  statusLabel="Adding entry..."
                >
                  Add entry
                </AsynchronousSubmitButton>
              </ComponentRoleContext>
              {!viewModel.shortcutExpanded && (
                <ComponentRoleContext role="tertiary">
                  <Button type="button" onClick={viewModel.expandShortcutEntryDialog}>
                    <Maximize2 aria-hidden="true" />
                    Expand
                  </Button>
                </ComponentRoleContext>
              )}
            </DialogFooterActions>
          )}
        >
          {selectedShortcut && !viewModel.shortcutExpanded && (
            <ShortcutEntryForm
              key={selectedShortcut.id}
              formId={viewModel.shortcutEntryFormId}
              today={viewModel.todayDate}
              category={selectedShortcut.category}
              defaultAmountCents={selectedShortcut.defaultAmountCents}
              description={selectedShortcut.description}
              effect={selectedShortcut.effect}
              onAdd={viewModel.addShortcutEntry}
            />
          )}

          {selectedShortcut && viewModel.shortcutExpanded && viewModel.shortcutEntryInitialValue && (
            <EntryForm
              key={`${selectedShortcut.id}-expanded`}
              formId={viewModel.shortcutEntryFormId}
              today={viewModel.todayDate}
              initialValue={viewModel.shortcutEntryInitialValue}
              onAdd={viewModel.addShortcutEntry}
            />
          )}
        </AppDialog>

        <AppDialog
          open={viewModel.dialog === 'invite'}
          title="Invite member"
          onClose={viewModel.closeDialog}
          footer={(
            <DialogFooterActions>
              <ComponentRoleContext role="primary">
                <AsynchronousSubmitButton
                  form={viewModel.inviteMemberFormId}
                  loader={viewModel.inviteMemberLoader}
                  statusLabel="Sending invitation..."
                >
                  Invite
                </AsynchronousSubmitButton>
              </ComponentRoleContext>
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
              <ComponentRoleContext role="primary">
                <AsynchronousSubmitButton
                  form={viewModel.addRecurringFormId}
                  loader={viewModel.addRecurringItemLoader}
                  statusLabel="Saving recurring..."
                >
                  Save recurring
                </AsynchronousSubmitButton>
              </ComponentRoleContext>
            </DialogFooterActions>
          )}
        >
          {viewModel.dialog === 'recurring' && (
            <AddRecurringForm
              formId={viewModel.addRecurringFormId}
              today={viewModel.asOfDate}
              onSave={viewModel.addRecurringItem}
            />
          )}
        </AppDialog>

        <AppDialog
          open={viewModel.dialog === 'edit-recurring' && Boolean(selectedRecurringItem)}
          title="Edit recurring"
          onClose={viewModel.closeDialog}
          footer={selectedRecurringItem && (
            <DialogFooterActions>
              <ComponentRoleContext role="primary">
                <AsynchronousSubmitButton
                  form={viewModel.editRecurringFormId}
                  loader={viewModel.editRecurringItemLoader}
                  statusLabel="Saving recurring..."
                >
                  Save recurring
                </AsynchronousSubmitButton>
              </ComponentRoleContext>
              <ComponentRoleContext role="destructive">
                <Button
                  type="button"
                  onClick={() => confirmDeleteRecurring(viewModel.deleteSelectedRecurringItem)}
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              </ComponentRoleContext>
            </DialogFooterActions>
          )}
        >
          {selectedRecurringItem && (
            <EditRecurringForm
              key={selectedRecurringItem.id}
              formId={viewModel.editRecurringFormId}
              item={selectedRecurringItem}
              onSave={viewModel.updateSelectedRecurringItem}
            />
          )}
        </AppDialog>
      </section>
    </LoaderContainer>
  )
}
