import type { SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { ledgerRequestNames } from '../../../common/ledgerRequestIdentifiers'
import {
  expectDirectGroupAccess,
  expectDirectMutationBlocked,
  expectFunctionGroupAccess,
  groupExpectation,
  ids,
  invokeLedger,
  invokeLoadLedger,
  selectRows
} from './securityAssertions'
import {
  createAnonymousClient,
  createSignedInClient,
  requireLocalFunctionsReady
} from './localSupabase'
import { directMutationCases, functionMutationCases } from './securityMutationCases'
import {
  expectDirectAllowedWritesWork,
  expectFunctionAllowedWritesWork
} from './securityPositiveWrites'
import {
  cleanupSecurityFixture,
  createSecurityFixture,
  type SecurityFixture
} from './securityFixture'
import type { GroupScopedRow, IdRow, MemberRow, ProfileRow } from './securityTypes'

let fixture: SecurityFixture | undefined
let anonymousClient: SupabaseClient
let ownerClient: SupabaseClient
let memberClient: SupabaseClient
let outsiderClient: SupabaseClient
let inviteeClient: SupabaseClient
let acceptInviteeClient: SupabaseClient
let rejectInviteeClient: SupabaseClient
let profilelessClient: SupabaseClient

const appTables = [
  { name: 'profiles', select: 'id' },
  { name: 'groups', select: 'id' },
  { name: 'group_members', select: 'id' },
  { name: 'group_invitations', select: 'id' },
  { name: 'ledger_entries', select: 'id' },
  { name: 'entry_shortcuts', select: 'id' },
  { name: 'recurring_items', select: 'id' }
]

const requireFixture = () => {
  if (!fixture) {
    throw new Error('Security fixture was not created.')
  }

  return fixture
}

beforeAll(async () => {
  await requireLocalFunctionsReady()
  fixture = await createSecurityFixture()
  anonymousClient = createAnonymousClient()
  ownerClient = await createSignedInClient(fixture.users.owner.email, fixture.users.owner.password)
  memberClient = await createSignedInClient(fixture.users.member.email, fixture.users.member.password)
  outsiderClient = await createSignedInClient(fixture.users.outsider.email, fixture.users.outsider.password)
  inviteeClient = await createSignedInClient(fixture.users.invitee.email, fixture.users.invitee.password)
  acceptInviteeClient = await createSignedInClient(fixture.users.acceptInvitee.email, fixture.users.acceptInvitee.password)
  rejectInviteeClient = await createSignedInClient(fixture.users.rejectInvitee.email, fixture.users.rejectInvitee.password)
  profilelessClient = await createSignedInClient(fixture.users.profileless.email, fixture.users.profileless.password)
})

afterAll(async () => {
  await cleanupSecurityFixture(fixture)
})

describe('ledger security integration', () => {
  test('anonymous users cannot call business functions', async () => {
    for (const identifier of ledgerRequestNames) {
      const { data, error } = await invokeLedger(anonymousClient, identifier, {})

      expect(error, identifier).toBeTruthy()
      expect(data, identifier).toBeFalsy()
    }
  })

  test('anonymous users cannot read app tables directly', async () => {
    for (const table of appTables) {
      const { data } = await anonymousClient
        .from(table.name)
        .select(table.select)
        .limit(10)

      expect(data ?? [], table.name).toHaveLength(0)
    }
  })

  test('anonymous users cannot directly create, update, or delete app table rows', async () => {
    for (const mutation of directMutationCases(requireFixture())) {
      await expectDirectMutationBlocked(anonymousClient, mutation)
    }
  })

  test('active group members only load their group data through functions', async () => {
    const securityFixture = requireFixture()
    const visible = groupExpectation(securityFixture, 'visible')
    const hidden = groupExpectation(securityFixture, 'hidden')

    await expectFunctionGroupAccess(ownerClient, visible, hidden)
    await expectFunctionGroupAccess(memberClient, visible, hidden)
    await expectFunctionGroupAccess(outsiderClient, hidden, visible)
  })

  test('active group members only read their group rows directly', async () => {
    const securityFixture = requireFixture()
    const visible = groupExpectation(securityFixture, 'visible')
    const hidden = groupExpectation(securityFixture, 'hidden')

    await expectDirectGroupAccess(
      ownerClient,
      securityFixture.users.owner.id,
      [
        securityFixture.users.member.id,
        securityFixture.users.outsider.id,
        securityFixture.users.invitee.id,
        securityFixture.users.acceptInvitee.id,
        securityFixture.users.rejectInvitee.id
      ],
      visible,
      hidden
    )
    await expectDirectGroupAccess(
      memberClient,
      securityFixture.users.member.id,
      [
        securityFixture.users.owner.id,
        securityFixture.users.outsider.id,
        securityFixture.users.invitee.id,
        securityFixture.users.acceptInvitee.id,
        securityFixture.users.rejectInvitee.id
      ],
      visible,
      hidden
    )
    await expectDirectGroupAccess(
      outsiderClient,
      securityFixture.users.outsider.id,
      [
        securityFixture.users.owner.id,
        securityFixture.users.member.id,
        securityFixture.users.invitee.id,
        securityFixture.users.acceptInvitee.id,
        securityFixture.users.rejectInvitee.id
      ],
      hidden,
      visible
    )
  })

  test('authenticated users cannot directly create, update, or delete protected rows they do not own', async () => {
    for (const mutation of directMutationCases(requireFixture())) {
      await expectDirectMutationBlocked(ownerClient, mutation)
    }
  })

  test('protected functions cannot create, update, or delete rows outside the caller groups', async () => {
    for (const mutation of functionMutationCases(requireFixture())) {
      const { error } = await invokeLedger(ownerClient, mutation.identifier, mutation.params)

      if (mutation.shouldError) {
        expect(error, mutation.identifier).toBeTruthy()
      } else {
        expect(error, mutation.identifier).toBeFalsy()
      }

      await mutation.verifyUnchanged()
    }
  })

  test('pending invitees can only see their own invitation state', async () => {
    const securityFixture = requireFixture()
    const state = await invokeLoadLedger(inviteeClient)
    const groups = await selectRows<IdRow>(inviteeClient, 'groups', 'id')
    const entries = await selectRows<IdRow>(inviteeClient, 'ledger_entries', 'id')
    const shortcuts = await selectRows<IdRow>(inviteeClient, 'entry_shortcuts', 'id')
    const recurringItems = await selectRows<IdRow>(inviteeClient, 'recurring_items', 'id')
    const members = await selectRows<MemberRow>(inviteeClient, 'group_members', 'id, group_id, email, status')
    const invitations = await selectRows<GroupScopedRow>(inviteeClient, 'group_invitations', 'id, group_id')
    const profiles = await selectRows<ProfileRow>(inviteeClient, 'profiles', 'id, email')

    expect(state.groups).toHaveLength(0)
    expect(ids(state.pendingInvitations)).toContain(securityFixture.invitations.visible)
    expect(ids(state.pendingInvitations)).not.toContain(securityFixture.invitations.hidden)
    expect(groups).toHaveLength(0)
    expect(entries).toHaveLength(0)
    expect(shortcuts).toHaveLength(0)
    expect(recurringItems).toHaveLength(0)
    expect(members).toEqual([
      expect.objectContaining({
        email: securityFixture.users.invitee.email,
        group_id: securityFixture.groups.visible,
        status: 'invited'
      })
    ])
    expect(ids(invitations)).toContain(securityFixture.invitations.visible)
    expect(ids(invitations)).not.toContain(securityFixture.invitations.hidden)
    expect(ids(profiles)).toEqual([securityFixture.users.invitee.id])
  })

  test('authorized users can create, update, and delete allowed rows directly', async () => {
    await expectDirectAllowedWritesWork(ownerClient, profilelessClient, requireFixture())
  })

  test('authorized users can create, update, and delete allowed rows through functions', async () => {
    await expectFunctionAllowedWritesWork(ownerClient, acceptInviteeClient, rejectInviteeClient, requireFixture())
  })
})
