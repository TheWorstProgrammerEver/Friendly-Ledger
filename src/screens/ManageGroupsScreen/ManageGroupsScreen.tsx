import { NavLink } from 'react-router-dom'
import { AppDialog } from '../../components/AppDialog/AppDialog'
import { GroupCreator } from '../../components/GroupCreator/GroupCreator'
import { InvitationPanel } from '../../components/InvitationPanel/InvitationPanel'
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
        {viewModel.groups.length > 0 ? (
          <ul>
            {viewModel.groups.map((group) => (
              <li key={group.id}>
                <span>
                  <strong>{group.name}</strong>
                  <small>{group.members.length} people</small>
                </span>
                <NavLink to={`/groups/${group.id}`}>Open</NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <p>No groups yet</p>
        )}
      </section>

      <AppDialog
        open={viewModel.creatingGroup}
        title="Create group"
        onClose={viewModel.closeCreateGroup}
      >
        <GroupCreator onCreateGroup={viewModel.createGroup} />
      </AppDialog>
    </section>
  )
}
