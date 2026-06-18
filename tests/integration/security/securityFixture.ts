import { randomUUID } from 'node:crypto'
import { createAdminClient } from './localSupabase'

export type FixtureUser = {
  email: string
  id: string
  name: string
  password: string
}

export type SecurityFixture = {
  groups: {
    hidden: string
    visible: string
  }
  invitations: {
    acceptVisible: string
    hidden: string
    rejectVisible: string
    visible: string
  }
  rows: {
    acceptInvitedMember: string
    hiddenEntry: string
    hiddenMember: string
    hiddenRecurring: string
    hiddenShortcut: string
    invitedMember: string
    rejectInvitedMember: string
    visibleEntry: string
    visibleMember: string
    visibleRecurring: string
    visibleShortcut: string
  }
  users: {
    acceptInvitee: FixtureUser
    invitee: FixtureUser
    member: FixtureUser
    outsider: FixtureUser
    owner: FixtureUser
    profileless: FixtureUser
    rejectInvitee: FixtureUser
  }
  prefix: string
}

const password = 'password123'
const today = '2026-06-19'

const createEmptyFixture = (): SecurityFixture => {
  const prefix = `security-${Date.now()}-${randomUUID().slice(0, 8)}`
  const user = (role: string, name: string): FixtureUser => ({
    email: `${prefix}-${role}@example.com`,
    id: '',
    name,
    password
  })

  return {
    prefix,
    users: {
      owner: user('owner', 'Security Owner'),
      member: user('member', 'Security Member'),
      outsider: user('outsider', 'Security Outsider'),
      invitee: user('invitee', 'Security Invitee'),
      acceptInvitee: user('accept-invitee', 'Security Accept Invitee'),
      rejectInvitee: user('reject-invitee', 'Security Reject Invitee'),
      profileless: user('profileless', 'Security Profileless')
    },
    groups: {
      visible: randomUUID(),
      hidden: randomUUID()
    },
    invitations: {
      visible: randomUUID(),
      hidden: randomUUID(),
      acceptVisible: randomUUID(),
      rejectVisible: randomUUID()
    },
    rows: {
      visibleEntry: randomUUID(),
      hiddenEntry: randomUUID(),
      visibleMember: randomUUID(),
      hiddenMember: randomUUID(),
      invitedMember: randomUUID(),
      acceptInvitedMember: randomUUID(),
      rejectInvitedMember: randomUUID(),
      visibleRecurring: randomUUID(),
      hiddenRecurring: randomUUID(),
      visibleShortcut: randomUUID(),
      hiddenShortcut: randomUUID()
    }
  }
}

const createUsers = async (fixture: SecurityFixture) => {
  const admin = createAdminClient()

  for (const user of Object.values(fixture.users)) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      password: user.password,
      user_metadata: {
        display_name: user.name
      }
    })

    if (error) {
      throw error
    }

    user.id = data.user.id
  }
}

const insertRows = async (table: string, rows: unknown[]) => {
  const { error } = await createAdminClient()
    .from(table)
    .insert(rows)

  if (error) {
    throw error
  }
}

const seedFixtureRows = async (fixture: SecurityFixture) => {
  const { groups, invitations, prefix, rows, users } = fixture

  await insertRows('profiles', [
    users.owner,
    users.member,
    users.outsider,
    users.invitee,
    users.acceptInvitee,
    users.rejectInvitee
  ].map((user) => ({
      id: user.id,
      display_name: user.name,
      email: user.email,
      created_date: today
    })))

  await insertRows('groups', [
    {
      id: groups.visible,
      name: `${prefix} visible group`,
      created_by_profile_id: users.owner.id,
      created_date: today
    },
    {
      id: groups.hidden,
      name: `${prefix} hidden group`,
      created_by_profile_id: users.outsider.id,
      created_date: today
    }
  ])

  await insertRows('group_members', [
    {
      id: randomUUID(),
      group_id: groups.visible,
      profile_id: users.owner.id,
      name: users.owner.name,
      email: users.owner.email,
      status: 'active',
      created_date: today
    },
    {
      id: rows.visibleMember,
      group_id: groups.visible,
      profile_id: users.member.id,
      name: users.member.name,
      email: users.member.email,
      status: 'active',
      created_date: today
    },
    {
      id: rows.invitedMember,
      group_id: groups.visible,
      name: users.invitee.name,
      email: users.invitee.email,
      status: 'invited',
      created_date: today
    },
    {
      id: rows.acceptInvitedMember,
      group_id: groups.visible,
      name: users.acceptInvitee.name,
      email: users.acceptInvitee.email,
      status: 'invited',
      created_date: today
    },
    {
      id: rows.rejectInvitedMember,
      group_id: groups.visible,
      name: users.rejectInvitee.name,
      email: users.rejectInvitee.email,
      status: 'invited',
      created_date: today
    },
    {
      id: rows.hiddenMember,
      group_id: groups.hidden,
      profile_id: users.outsider.id,
      name: users.outsider.name,
      email: users.outsider.email,
      status: 'active',
      created_date: today
    }
  ])

  await insertRows('group_invitations', [
    {
      id: invitations.visible,
      group_id: groups.visible,
      group_name: `${prefix} visible group`,
      email: users.invitee.email,
      invited_date: today
    },
    {
      id: invitations.acceptVisible,
      group_id: groups.visible,
      group_name: `${prefix} visible group`,
      email: users.acceptInvitee.email,
      invited_date: today
    },
    {
      id: invitations.rejectVisible,
      group_id: groups.visible,
      group_name: `${prefix} visible group`,
      email: users.rejectInvitee.email,
      invited_date: today
    },
    {
      id: invitations.hidden,
      group_id: groups.hidden,
      group_name: `${prefix} hidden group`,
      email: `${prefix}-hidden-invitee@example.com`,
      invited_date: today
    }
  ])

  await insertRows('ledger_entries', [
    {
      id: rows.visibleEntry,
      group_id: groups.visible,
      entry_date: today,
      description: 'Visible entry',
      category: 'Security',
      amount_cents: 100,
      created_by_profile_id: users.owner.id,
      created_by_name: users.owner.name,
      created_date: today
    },
    {
      id: rows.hiddenEntry,
      group_id: groups.hidden,
      entry_date: today,
      description: 'Hidden entry',
      category: 'Security',
      amount_cents: 200,
      created_by_profile_id: users.outsider.id,
      created_by_name: users.outsider.name,
      created_date: today
    }
  ])

  await insertRows('entry_shortcuts', [
    {
      id: rows.visibleShortcut,
      group_id: groups.visible,
      label: 'Visible shortcut',
      emoji: 'S',
      description: 'Visible shortcut entry',
      category: 'Security',
      effect: 'positive',
      default_amount_cents: 100,
      created_date: today
    },
    {
      id: rows.hiddenShortcut,
      group_id: groups.hidden,
      label: 'Hidden shortcut',
      emoji: 'S',
      description: 'Hidden shortcut entry',
      category: 'Security',
      effect: 'negative',
      default_amount_cents: 200,
      created_date: today
    }
  ])

  await insertRows('recurring_items', [
    {
      id: rows.visibleRecurring,
      group_id: groups.visible,
      title: 'Visible recurring',
      category: 'Security',
      amount_cents: -100,
      frequency: 'weekly',
      start_date: today,
      active: true,
      created_date: today
    },
    {
      id: rows.hiddenRecurring,
      group_id: groups.hidden,
      title: 'Hidden recurring',
      category: 'Security',
      amount_cents: -200,
      frequency: 'weekly',
      start_date: today,
      active: true,
      created_date: today
    }
  ])
}

export const cleanupSecurityFixture = async (fixture?: SecurityFixture) => {
  if (!fixture) {
    return
  }

  const admin = createAdminClient()

  await admin.from('groups').delete().ilike('name', `${fixture.prefix}%`)
  await admin.from('group_invitations').delete().ilike('email', `${fixture.prefix}%`)
  await admin.from('group_members').delete().ilike('email', `${fixture.prefix}%`)
  await admin.from('profiles').delete().ilike('email', `${fixture.prefix}%`)

  await Promise.all(Object.values(fixture.users)
    .filter((user) => user.id)
    .map((user) => admin.auth.admin.deleteUser(user.id)))
}

export const createSecurityFixture = async () => {
  const fixture = createEmptyFixture()

  try {
    await createUsers(fixture)
    await seedFixtureRows(fixture)

    return fixture
  } catch (error) {
    await cleanupSecurityFixture(fixture)
    throw error
  }
}
