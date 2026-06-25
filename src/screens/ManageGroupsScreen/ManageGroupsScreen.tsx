import { ArrowRight, Plus } from 'lucide-react'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { ActionLink } from '../../../lib/ui/Button/ActionLink'
import { Button } from '../../../lib/ui/Button/Button'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { GroupCreator } from '../../components/GroupCreator/GroupCreator'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { InvitationPanel } from '../../components/InvitationPanel/InvitationPanel'
import { List, ListItem } from '../../../lib/ui/List/List'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
import { useManageGroupsScreenViewModel } from './useManageGroupsScreenViewModel'
import styles from './ManageGroupsScreen.module.scss'

export const ManageGroupsScreen = () => {
  const viewModel = useManageGroupsScreenViewModel()

  return (
    <section className={styles.screen} aria-labelledby="manage-groups-title">
      <HeaderWithActions
        header={<h2 id="manage-groups-title">Manage Groups</h2>}
        actions={(
          <ComponentRoleContext role="primary">
            <Button type="button" onClick={viewModel.openCreateGroup}>
              <ResponsiveContent icon={<Plus />}>Create group</ResponsiveContent>
            </Button>
          </ComponentRoleContext>
        )}
      />

      <InvitationPanel viewModel={viewModel.invitationViewModel} />

      <section className={styles.groups} aria-labelledby="groups-title">
        <h3 id="groups-title">Groups</h3>
        <LoaderContainer loader={viewModel.ledgerLoad} loadingLabel="Loading groups...">
          {viewModel.groups.length > 0 && (
            <List ariaLabel="Groups">
              {viewModel.groups.map((group) => (
                <ListItem
                  key={group.id}
                  details={(
                    <>
                      <strong>{group.name}</strong>
                      <small>{group.members.length} people</small>
                    </>
                  )}
                  actions={(
                    <ComponentRoleContext role="tertiary">
                      <ActionLink to={`/groups/${group.id}`}>
                        <ResponsiveContent icon={<ArrowRight />}>Open</ResponsiveContent>
                      </ActionLink>
                    </ComponentRoleContext>
                  )}
                />
              ))}
            </List>
          )}
          {viewModel.groups.length === 0 && viewModel.ledgerLoad.settled && (
            <p>No groups yet</p>
          )}
        </LoaderContainer>
      </section>

      <AppDialog
        open={viewModel.creatingGroup}
        title="Create group"
        onClose={viewModel.closeCreateGroup}
        footer={(
          <DialogFooterActions>
            <ComponentRoleContext role="primary">
              <AsynchronousSubmitButton
                form={viewModel.createGroupFormId}
                loader={viewModel.createGroupLoader}
                statusLabel="Creating group..."
              >
                Create group
              </AsynchronousSubmitButton>
            </ComponentRoleContext>
          </DialogFooterActions>
        )}
      >
        <GroupCreator formId={viewModel.createGroupFormId} onCreateGroup={viewModel.createGroup} />
      </AppDialog>
    </section>
  )
}
