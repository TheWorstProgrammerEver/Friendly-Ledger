import { ledgerRequestIdentifiers } from '../../../../common/ledgerRequestIdentifiers.ts'
import { HttpError, nameFromEmail, normalizeEmail, todayIso } from '../helpers.ts'
import { invitationFromRow, memberFromRow } from '../mappers.ts'
import { getProfile } from '../profile.ts'
import type { InvitationRow, MemberRow } from '../types/rows.ts'
import { createLedgerRequestHandlerFactory } from './handlerFactory.ts'

type InviteMemberParams = {
  groupId: string
  email: string
}

type AcceptInvitationParams = {
  invitationId: string
}

const memberColumns = 'id, group_id, profile_id, name, email, status'
const invitationColumns = 'id, group_id, group_name, email, invited_date'

export const createInviteMemberHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.inviteMember, ({ client }) =>
  async (request) => {
    const { groupId, email } = request.params as InviteMemberParams
    const normalizedEmail = normalizeEmail(email)

    if (!groupId || !normalizedEmail) {
      throw new HttpError(400, 'Choose a group and email to invite.')
    }

    const { data: group, error: groupError } = await client
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .maybeSingle<{ name: string }>()

    if (groupError) {
      throw groupError
    }

    if (!group) {
      throw new HttpError(404, 'Group not found.')
    }

    const { data: existingMember, error: existingMemberError } = await client
      .from('group_members')
      .select(memberColumns)
      .eq('group_id', groupId)
      .eq('email', normalizedEmail)
      .maybeSingle<MemberRow>()

    if (existingMemberError) {
      throw existingMemberError
    }

    let member = existingMember

    if (!member) {
      member = {
        id: crypto.randomUUID(),
        group_id: groupId,
        profile_id: null,
        name: nameFromEmail(normalizedEmail),
        email: normalizedEmail,
        status: 'invited'
      }
      const { error: memberError } = await client
        .from('group_members')
        .insert(member)

      if (memberError) {
        throw memberError
      }
    }

    const { data: existingInvitation, error: existingInvitationError } = await client
      .from('group_invitations')
      .select(invitationColumns)
      .eq('group_id', groupId)
      .eq('email', normalizedEmail)
      .maybeSingle<InvitationRow>()

    if (existingInvitationError) {
      throw existingInvitationError
    }

    let invitation = existingInvitation

    if (!invitation) {
      invitation = {
        id: crypto.randomUUID(),
        group_id: groupId,
        group_name: group.name,
        email: normalizedEmail,
        invited_date: todayIso()
      }
      const { error: invitationError } = await client
        .from('group_invitations')
        .insert(invitation)

      if (invitationError) {
        throw invitationError
      }
    }

    return {
      groupId,
      member: memberFromRow(member),
      invitation: invitationFromRow(invitation)
    }
  })

export const createAcceptInvitationHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.acceptInvitation, ({ client, user }) =>
  async (request) => {
    const { invitationId } = request.params as AcceptInvitationParams
    const profile = await getProfile(client, user)
    const { data: invitation, error: invitationError } = await client
      .from('group_invitations')
      .select(invitationColumns)
      .eq('id', invitationId)
      .maybeSingle<InvitationRow>()

    if (invitationError) {
      throw invitationError
    }

    if (!invitation) {
      throw new HttpError(404, 'Invitation not found.')
    }

    if (invitation.email !== profile.email) {
      throw new HttpError(403, 'This invitation belongs to another email address.')
    }

    const { data: updatedMembers, error: memberUpdateError } = await client
      .from('group_members')
      .update({
        profile_id: profile.id,
        name: profile.display_name,
        status: 'active'
      })
      .eq('group_id', invitation.group_id)
      .eq('email', profile.email)
      .select(memberColumns)

    if (memberUpdateError) {
      throw memberUpdateError
    }

    const updatedMemberRows = updatedMembers as MemberRow[] | null
    let member = (updatedMemberRows ?? [])[0]

    if (!member) {
      member = {
        id: crypto.randomUUID(),
        group_id: invitation.group_id,
        profile_id: profile.id,
        name: profile.display_name,
        email: profile.email,
        status: 'active'
      }
      const { error: memberInsertError } = await client
        .from('group_members')
        .insert(member)

      if (memberInsertError) {
        throw memberInsertError
      }
    }

    const { error: deleteInvitationError } = await client
      .from('group_invitations')
      .delete()
      .eq('id', invitation.id)

    if (deleteInvitationError) {
      throw deleteInvitationError
    }

    return {
      groupId: invitation.group_id,
      member: memberFromRow(member),
      invitationId: invitation.id
    }
  })

export const createRejectInvitationHandler = createLedgerRequestHandlerFactory(ledgerRequestIdentifiers.rejectInvitation, ({ client, user }) =>
  async (request) => {
    const { invitationId } = request.params as AcceptInvitationParams
    const profile = await getProfile(client, user)
    const { data: invitation, error: invitationError } = await client
      .from('group_invitations')
      .select(invitationColumns)
      .eq('id', invitationId)
      .maybeSingle<InvitationRow>()

    if (invitationError) {
      throw invitationError
    }

    if (!invitation) {
      throw new HttpError(404, 'Invitation not found.')
    }

    if (invitation.email !== profile.email) {
      throw new HttpError(403, 'This invitation belongs to another email address.')
    }

    const { error: memberDeleteError } = await client
      .from('group_members')
      .delete()
      .eq('group_id', invitation.group_id)
      .eq('email', profile.email)
      .eq('status', 'invited')

    if (memberDeleteError) {
      throw memberDeleteError
    }

    const { error: invitationDeleteError } = await client
      .from('group_invitations')
      .delete()
      .eq('id', invitation.id)

    if (invitationDeleteError) {
      throw invitationDeleteError
    }

    return {
      groupId: invitation.group_id,
      invitationId: invitation.id
    }
  })
