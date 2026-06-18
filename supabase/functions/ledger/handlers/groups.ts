import { ledgerRequestIdentifiers } from '../../../../common/ledgerRequestIdentifiers.ts'
import { nameFromEmail, todayIso, trimOrDefault, uniqueEmails } from '../helpers.ts'
import { loadState } from '../ledgerState.ts'
import { getProfile } from '../profile.ts'
import { createLedgerRequestHandlerFactory } from './handlerFactory.ts'

type CreateGroupParams = {
  name: string
  inviteEmails: string[]
}

export const createLoadLedgerHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.load, ({ client, user }) =>
  async (request) => {
    const params = request.params as { activeGroupId?: string }
    const profile = await getProfile(client, user)

    return await loadState(client, profile.id, profile.email, params.activeGroupId)
  })

export const createCreateGroupHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.createGroup, ({ client, user }) =>
  async (request) => {
    const { name, inviteEmails } = request.params as CreateGroupParams
    const profile = await getProfile(client, user)
    const emails = uniqueEmails(inviteEmails, profile.email)
    const groupId = crypto.randomUUID()
    const activeMemberId = crypto.randomUUID()
    const createdDate = todayIso()
    const invitedMembers = emails.map((email) => ({
      id: crypto.randomUUID(),
      group_id: groupId,
      name: nameFromEmail(email),
      email,
      status: 'invited' as const
    }))
    const invitations = emails.map((email) => ({
      id: crypto.randomUUID(),
      group_id: groupId,
      group_name: trimOrDefault(name, 'House ledger'),
      email,
      invited_date: createdDate
    }))
    const { error: groupError } = await client
      .from('groups')
      .insert({
        id: groupId,
        name: trimOrDefault(name, 'House ledger'),
        created_by_profile_id: profile.id,
        created_date: createdDate
      })

    if (groupError) {
      throw groupError
    }

    const { error: memberError } = await client
      .from('group_members')
      .insert([
        {
          id: activeMemberId,
          group_id: groupId,
          profile_id: profile.id,
          name: profile.display_name,
          email: profile.email,
          status: 'active'
        },
        ...invitedMembers
      ])

    if (memberError) {
      throw memberError
    }

    if (emails.length > 0) {
      const { error: invitationError } = await client
        .from('group_invitations')
        .insert(invitations)

      if (invitationError) {
        throw invitationError
      }
    }

    return {
      group: {
        id: groupId,
        name: trimOrDefault(name, 'House ledger'),
        createdDate,
        members: [
          {
            id: activeMemberId,
            accountId: profile.id,
            name: profile.display_name,
            email: profile.email,
            status: 'active'
          },
          ...invitedMembers.map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            status: member.status
          }))
        ],
        invitations: invitations.map((invitation) => ({
          id: invitation.id,
          groupId: invitation.group_id,
          groupName: invitation.group_name,
          email: invitation.email,
          invitedDate: invitation.invited_date
        })),
        entries: [],
        entryShortcuts: [],
        recurringItems: []
      }
    }
  })
