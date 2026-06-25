import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { List, ListItem } from '../../../lib/ui/List/List'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { ResponsiveActionLink } from '../../../lib/ui/ResponsiveActionLink/ResponsiveActionLink'
import { ResponsiveButton } from '../../../lib/ui/ResponsiveButton/ResponsiveButton'
import { AddRecurringForm, EditRecurringForm } from '../../components/RecurringForm/RecurringForm'
import { Screen } from '../../components/Screen/Screen'
import { recurringItemSummary } from '../../domain/recurringItemSummary'
import { useConfirmation } from '../../../lib/hooks/useConfirmation'
import { useManageRecurringScreenViewModel } from './useManageRecurringScreenViewModel'
import styles from './ManageRecurringScreen.module.scss'

export const ManageRecurringScreen = () => {
  const viewModel = useManageRecurringScreenViewModel()
  const confirmDeleteRecurring = useConfirmation('Delete this recurring rule?')

  if (viewModel.shouldRedirect) {
    return <Navigate to="/groups/manage" replace />
  }

  if (!viewModel.group) {
    return (
      <LoaderContainer loader={viewModel.ledgerLoad} loadingLabel="Loading ledger...">
        <Screen aria-label="Loading recurring items" />
      </LoaderContainer>
    )
  }

  return (
    <Screen className={styles.content} aria-labelledby="manage-recurring-title">
      <HeaderWithActions
        header={(
          <>
            <h2 id="manage-recurring-title">Recurring</h2>
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
                label="Add recurring"
                onClick={viewModel.openAddDialog}
              />
            </ComponentRoleContext>
          </>
        )}
      />

      <section aria-label="Manage recurring">
        {viewModel.recurringItems.length > 0 ? (
          <List>
            {viewModel.recurringItems.map((item) => (
              <ListItem
                key={item.id}
                actionsLabel={`${item.title} actions`}
                details={(
                  <>
                    <strong>{item.title}</strong>
                    <small>{recurringItemSummary(item)}</small>
                  </>
                )}
                actions={(
                  <>
                    <ComponentRoleContext role="tertiary">
                      <ResponsiveButton
                        type="button"
                        icon={<Pencil />}
                        label="Edit"
                        onClick={() => viewModel.openEditDialog(item.id)}
                      />
                    </ComponentRoleContext>
                    <ComponentRoleContext role="destructive">
                      <ResponsiveButton
                        type="button"
                        icon={<Trash2 />}
                        label="Delete"
                        onClick={() => confirmDeleteRecurring(() => viewModel.deleteRecurringItem(item.id))}
                      />
                    </ComponentRoleContext>
                  </>
                )}
              />
            ))}
          </List>
        ) : (
          <p>No recurring rules</p>
        )}
      </section>

      <AppDialog
        open={viewModel.dialog === 'add'}
        title="Add recurring"
        onClose={viewModel.closeDialog}
        footer={(
          <DialogFooterActions>
            <ComponentRoleContext role="primary">
              <AsynchronousSubmitButton
                form={viewModel.addRecurringFormId}
                loader={viewModel.addRecurringLoader}
                statusLabel="Saving recurring..."
              >
                Save recurring
              </AsynchronousSubmitButton>
            </ComponentRoleContext>
          </DialogFooterActions>
        )}
      >
        {viewModel.dialog === 'add' && (
          <AddRecurringForm
            formId={viewModel.addRecurringFormId}
            today={viewModel.today}
            onSave={viewModel.addRecurringItem}
          />
        )}
      </AppDialog>

      <AppDialog
        open={viewModel.dialog === 'edit' && Boolean(viewModel.selectedRecurringItem)}
        title="Edit recurring"
        onClose={viewModel.closeDialog}
        footer={viewModel.selectedRecurringItem && (
          <DialogFooterActions>
            <ComponentRoleContext role="primary">
              <AsynchronousSubmitButton
                form={viewModel.editRecurringFormId}
                loader={viewModel.editRecurringLoader}
                statusLabel="Saving recurring..."
              >
                Save recurring
              </AsynchronousSubmitButton>
            </ComponentRoleContext>
          </DialogFooterActions>
        )}
      >
        {viewModel.selectedRecurringItem && (
          <EditRecurringForm
            key={viewModel.selectedRecurringItem.id}
            formId={viewModel.editRecurringFormId}
            item={viewModel.selectedRecurringItem}
            onSave={viewModel.updateSelectedRecurringItem}
          />
        )}
      </AppDialog>
    </Screen>
  )
}
