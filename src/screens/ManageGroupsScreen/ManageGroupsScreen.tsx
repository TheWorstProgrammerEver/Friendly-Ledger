import { ArrowRight, Plus } from 'lucide-react'
import { AppDialog, DialogFooterActions } from '../../../lib/ui/AppDialog/AppDialog'
import { AsynchronousSubmitButton } from '../../../lib/ui/AsynchronousSubmitButton/AsynchronousSubmitButton'
import { ActionLink } from '../../../lib/ui/Button/ActionLink'
import { ComponentRoleContext } from '../../../lib/ui/ComponentRoleContext/ComponentRoleContext'
import { GroupCreator } from '../../components/GroupCreator/GroupCreator'
import { HeaderWithActions } from '../../../lib/ui/HeaderWithActions/HeaderWithActions'
import { InvitationPanel } from '../../components/InvitationPanel/InvitationPanel'
import { List, ListItem } from '../../../lib/ui/List/List'
import { LoaderContainer } from '../../../lib/ui/LoaderContainer/LoaderContainer'
import { IconAndLabel, IconOnly } from '../../../lib/ui/ResponsiveContent/IconContent'
import { ResponsiveContent } from '../../../lib/ui/ResponsiveContent/ResponsiveContent'
import { ResponsiveButton } from '../../../lib/ui/ResponsiveButton/ResponsiveButton'
import { Screen } from '../../components/Screen/Screen'
import { useManageGroupsScreenViewModel } from './useManageGroupsScreenViewModel'
import styles from './ManageGroupsScreen.module.scss'

export const ManageGroupsScreen = () => {
  const viewModel = useManageGroupsScreenViewModel()

  return (
    <Screen className={styles.content} aria-labelledby="manage-groups-title">
      <HeaderWithActions
        header={<h2 id="manage-groups-title">Manage Groups</h2>}
        actions={(
          <ComponentRoleContext role="primary">
            <ResponsiveButton
              type="button"
              icon={<Plus />}
              label="Create group"
              onClick={viewModel.openCreateGroup}
            />
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
                        <ResponsiveContent
                          compact={<IconOnly icon={<ArrowRight />} label={`Open ${group.name}`} />}
                          nonCompact={(
                            <IconAndLabel icon={<ArrowRight />} label={`Open ${group.name}`}>
                              Open
                            </IconAndLabel>
                          )}
                        />
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
    </Screen>
  )
}
