import { NavLink } from 'react-router-dom'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { GroupCreator } from '../../components/GroupCreator/GroupCreator'
import { InvitationPanel } from '../../components/InvitationPanel/InvitationPanel'
import { List, ListItem } from '../../../lib/ui/List/List'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { useManageGroupsScreenViewModel } from './useManageGroupsScreenViewModel'
import styles from './ManageGroupsScreen.module.scss'

export const ManageGroupsScreen = () => {
  const viewModel = useManageGroupsScreenViewModel()

  return (
    <section className={styles.screen} aria-labelledby="manage-groups-title">
      <header>
        <h2 id="manage-groups-title">Manage Groups</h2>
        <button type="button" onClick={viewModel.openCreateGroup}>Create group</button>
      </header>

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
                  actions={<NavLink to={`/groups/${group.id}`}>Open</NavLink>}
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
            <AsynchronousSubmitButton
              form={viewModel.createGroupFormId}
              loader={viewModel.createGroupLoader}
              statusLabel="Creating group..."
            >
              Create group
            </AsynchronousSubmitButton>
          </DialogFooterActions>
        )}
      >
        <GroupCreator formId={viewModel.createGroupFormId} onCreateGroup={viewModel.createGroup} />
      </AppDialog>
    </section>
  )
}
