import { expect, test, type Page } from '@playwright/test'
import { nameFromEmail } from '../../src/domain/people'
import { routeRuntimeConfig } from './runtimeConfig'
import { deleteSupabaseUsersByEmail, getSupabaseAdminClient } from './supabaseTestAuth'

const createdUserEmails = new Set<string>()

const pad = (value: number) => value.toString().padStart(2, '0')

const toDateInput = (date: Date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
)

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

const delay = (milliseconds: number) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds)
})

type SignInOptions = {
  email?: string
  name?: string
}

const uniqueTestEmail = (name: string) => {
  const localPart = name.trim().toLowerCase().split(/\s+/).filter(Boolean).join('.') || 'user'
  const uniqueDomain = `visual-${Date.now()}-${Math.random().toString(36).slice(2)}.example.com`

  return `${localPart}@${uniqueDomain}`
}

const signIn = async (page: Page, options: SignInOptions = {}) => {
  const email = options.email ?? uniqueTestEmail(options.name ?? 'Ryan')
  const name = nameFromEmail(email)
  createdUserEmails.add(email)

  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  await page.getByRole('button', { name: 'Create an account' }).click()
  await page.getByLabel('Email', { exact: true }).fill(email)
  await expect(page.getByLabel('Name', { exact: true })).not.toBeVisible()
  await page.getByLabel('Password', { exact: true }).fill('password')
  await page.getByRole('button', { name: 'Create account' }).click()

  return { email, name }
}

const loadGroupSnapshot = async (email: string, name: string) => {
  const admin = getSupabaseAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single<{ id: string }>()

  if (profileError) {
    throw profileError
  }

  const { data: group, error: groupError } = await admin
    .from('groups')
    .select('id')
    .eq('created_by_profile_id', profile.id)
    .eq('name', name)
    .single<{ id: string }>()

  if (groupError) {
    throw groupError
  }

  const [{ data: entries, error: entriesError }, { data: recurringItems, error: recurringError }] = await Promise.all([
    admin
      .from('ledger_entries')
      .select('id, created_by_profile_id, created_by_name')
      .eq('group_id', group.id),
    admin
      .from('recurring_items')
      .select('id, amount_cents, start_date')
      .eq('group_id', group.id)
  ])

  if (entriesError) {
    throw entriesError
  }

  if (recurringError) {
    throw recurringError
  }

  return {
    entries: entries ?? [],
    recurringItems: recurringItems ?? []
  }
}

const loadInvitationSnapshot = async (groupPath: string, email: string) => {
  const admin = getSupabaseAdminClient()
  const groupId = groupPath.split('/').at(-1)

  if (!groupId) {
    throw new Error(`Could not read group id from ${groupPath}`)
  }

  const [{ data: invitations, error: invitationError }, { data: members, error: memberError }] = await Promise.all([
    admin
      .from('group_invitations')
      .select('id')
      .eq('group_id', groupId)
      .eq('email', email),
    admin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('email', email)
  ])

  if (invitationError) {
    throw invitationError
  }

  if (memberError) {
    throw memberError
  }

  return {
    invitations: invitations ?? [],
    members: members ?? []
  }
}

test.beforeEach(async ({ page }) => {
  await routeRuntimeConfig(page)
})

test.afterEach(async () => {
  const emails = Array.from(createdUserEmails)
  createdUserEmails.clear()
  await deleteSupabaseUsersByEmail(emails)
})

test('renders configured authentication methods', async ({ page }) => {
  await page.goto('/sign-in')

  await expect(page.getByRole('button', { name: 'Sign in with passkey' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Password/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Magic link/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /One-time code/ })).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /One-time code/ }).click()
  await expect(page.getByLabel('Password', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Name', { exact: true })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Send code' })).toBeVisible()

  await page.getByRole('button', { name: /Magic link/ }).click()
  await expect(page.getByLabel('Password', { exact: true })).not.toBeVisible()
  await expect(page.getByLabel('Name', { exact: true })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible()

  await page.getByRole('button', { name: 'Create an account' }).click()
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Password/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Magic link/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /One-time code/ })).toBeVisible()

  await page.getByRole('button', { name: /One-time code/ }).click()
  await expect(page.getByRole('button', { name: 'Send code' })).toBeVisible()

  await page.getByRole('button', { name: /Magic link/ }).click()
  await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible()

  await page.getByRole('button', { name: /Password/ }).click()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  await expect(page.getByLabel('Name', { exact: true })).not.toBeVisible()
})

type CreateGroupOptions = {
  inviteEmails?: string
  name?: string
}

const createGroup = async (page: Page, options: CreateGroupOptions = {}) => {
  const inviteEmails = options.inviteEmails ?? 'sam@example.com'
  const name = options.name ?? 'House'

  await expect(page.getByRole('heading', { name: 'Manage Groups' })).toBeVisible()
  await page.getByRole('button', { name: 'Create group' }).click()

  const createGroupDialog = page.getByRole('dialog', { name: 'Create group' })
  await createGroupDialog.getByLabel('Group name').fill(name)
  await createGroupDialog.getByLabel('Invite emails').fill(inviteEmails)
  await createGroupDialog.getByRole('button', { name: 'Create group' }).click()
  await expect(page.getByRole('heading', { name })).toBeVisible()

  return new URL(page.url()).pathname
}

test('creates a group and records a ledger entry', async ({ page }) => {
  const account = await signIn(page)
  await createGroup(page)
  let delayedInviteRequest = false

  await expect(page.getByRole('link', { name: `Open profile for ${account.email}` })).toBeVisible()

  await page.setViewportSize({ width: 1600, height: 900 })

  const screenLayout = await page.getByRole('region', { name: 'House' }).evaluate((screen) => {
    const main = screen.closest('main')
    const screenBounds = screen.getBoundingClientRect()
    const mainBounds = main?.getBoundingClientRect()

    return {
      leftSpace: mainBounds ? screenBounds.left - mainBounds.left : 0,
      rightSpace: mainBounds ? mainBounds.right - screenBounds.right : 0,
      width: screenBounds.width
    }
  })

  expect(screenLayout.width).toBeLessThanOrEqual(1024)
  expect(Math.abs(screenLayout.leftSpace - screenLayout.rightSpace)).toBeLessThanOrEqual(1)

  const expandedView = page.getByRole('button', { name: 'Expanded group summary view' })

  await expect(expandedView).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('region', { name: 'Shortcuts' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Recurring' })).toBeVisible()
  await expandedView.click()

  const compactView = page.getByRole('button', { name: 'Compact group summary view' })

  await expect(compactView).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Shortcuts' })).not.toBeVisible()
  await expect(page.getByRole('region', { name: 'Recurring' })).not.toBeVisible()
  await page.reload()
  await expect(compactView).toHaveAttribute('aria-pressed', 'true')
  await compactView.click()
  await expect(expandedView).toHaveAttribute('aria-pressed', 'false')

  await page.route('**/functions/v1/ledger', async (route) => {
    const body = route.request().postDataJSON() as { identifier?: string }

    if (!delayedInviteRequest && body.identifier === 'inviteMember') {
      delayedInviteRequest = true
      await delay(500)
    }

    await route.continue()
  })

  await page.getByRole('button', { name: 'Invite' }).click()

  const inviteMember = page.getByRole('dialog', { name: 'Invite member' })
  const inviteEmail = inviteMember.getByLabel('Invite')
  const inviteButton = inviteMember.getByRole('button', { name: 'Invite' })

  await inviteEmail.fill('alex@example.com')
  await inviteButton.click()
  await expect(inviteEmail).toHaveValue('alex@example.com')
  await expect(inviteButton).toBeDisabled()
  await expect(inviteButton).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByText('3 people')).toBeVisible()

  await page.getByRole('button', { name: 'Invite' }).click()
  await expect(page.getByRole('dialog', { name: 'Invite member' }).getByLabel('Invite')).toHaveValue('')
  await page.getByRole('dialog', { name: 'Invite member' }).getByRole('button', { name: 'Close' }).click()

  await page.getByRole('button', { name: 'Add entry' }).click()

  const newEntry = page.getByRole('dialog', { name: 'Add entry' })

  await newEntry.getByLabel('Amount').fill('45')
  await newEntry.getByLabel('Description').fill('Groceries')
  await newEntry.getByRole('button', { name: 'Add entry' }).click()

  await expect(page.getByRole('heading', { name: 'House' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('Surplus')).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Entries' }).getByRole('cell', { name: '$45.00' })
  ).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('1 entry')).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Entries' }).getByRole('cell', { name: account.name })
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })

  const widths = await page.evaluate(() => {
    const main = document.querySelector('main')
    const tableWrap = document.querySelector('table')?.parentElement

    return {
      main: { client: main?.clientWidth, scroll: main?.scrollWidth },
      table: {
        clientHeight: tableWrap?.clientHeight,
        clientWidth: tableWrap?.clientWidth,
        scrollHeight: tableWrap?.scrollHeight,
        scrollWidth: tableWrap?.scrollWidth
      }
    }
  })

  expect(widths.main.scroll).toBe(widths.main.client)
  expect(widths.table.scrollWidth).toBeGreaterThan(widths.table.clientWidth ?? 0)
  expect(widths.table.scrollHeight).toBe(widths.table.clientHeight)

  await page.setViewportSize({ width: 1280, height: 720 })

  const savedState = await loadGroupSnapshot(account.email, 'House')
  const savedEntry = savedState.entries[0]

  expect(savedEntry).toEqual({
    created_by_profile_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    created_by_name: account.name,
    id: expect.stringMatching(/^[0-9a-f-]{36}$/)
  })

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('region', { name: 'Entries' }).getByRole('button', { name: 'Delete' }).click()
  await expect(
    page.getByRole('region', { name: 'Entries' }).getByRole('cell', { name: '$45.00' })
  ).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('region', { name: 'Entries' }).getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('No entries')).toBeVisible()
})

test('loads a direct group URL after the app reloads', async ({ page }) => {
  await signIn(page)
  const groupPath = await createGroup(page)

  await page.goto(groupPath)

  await expect(page).toHaveURL(new RegExp(`${groupPath}$`))
  await expect(page.getByRole('heading', { name: 'House' })).toBeVisible()
})

test('returns to a direct group URL after signing in', async ({ page }) => {
  const account = await signIn(page)
  const groupPath = await createGroup(page)

  await page.route('**/auth/v1/passkeys', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue()
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      json: [{
        id: 'test-passkey',
        friendly_name: 'Apple Passwords',
        created_at: '2026-06-25T00:00:00.000Z'
      }]
    })
  })

  await page.goto('/profile')
  const passkeys = page.getByRole('region', { name: 'Passkeys' })
  const passkeyActions = passkeys.getByRole('group', { name: 'Apple Passwords actions' })

  await expect(passkeys.getByText('Apple Passwords')).toBeVisible()

  await page.setViewportSize({ width: 694, height: 844 })
  await page.getByRole('button', { name: 'Hide navigation' }).click()
  await expect(page.getByRole('button', { name: 'Add passkey' }).getByText('Add passkey')).toBeVisible()

  const regularLayout = await passkeys.evaluate((region) => {
    const heading = region.querySelector('h3')
    const addButton = region.querySelector('header button')
    const item = region.querySelector('li')
    const details = item?.firstElementChild
    const actions = item?.lastElementChild

    return {
      actions: actions?.getBoundingClientRect().toJSON(),
      addButton: addButton?.getBoundingClientRect().toJSON(),
      details: details?.getBoundingClientRect().toJSON(),
      heading: heading?.getBoundingClientRect().toJSON(),
      item: item?.getBoundingClientRect().toJSON()
    }
  })

  const headingCenter = (regularLayout.heading?.y ?? 0) + (regularLayout.heading?.height ?? 0) / 2
  const addButtonCenter = (regularLayout.addButton?.y ?? 0) + (regularLayout.addButton?.height ?? 0) / 2

  expect(Math.abs(headingCenter - addButtonCenter)).toBeLessThanOrEqual(1)
  expect(regularLayout.actions?.y).toBeLessThan(regularLayout.details?.y + regularLayout.details?.height)

  await page.setViewportSize({ width: 680, height: 844 })

  const compactLayout = await passkeyActions.evaluate((actions) => {
    const item = actions.closest('li')
    const details = item?.firstElementChild
    const actionBounds = actions.getBoundingClientRect()
    const itemBounds = item?.getBoundingClientRect()
    const detailsBounds = details?.getBoundingClientRect()

    return {
      actionBottom: actionBounds.right,
      actionTop: actionBounds.top,
      detailsBottom: detailsBounds?.bottom,
      itemBottom: itemBounds?.right,
      itemWidth: itemBounds?.width,
      actionsWidth: actionBounds.width
    }
  })

  expect(compactLayout.actionTop).toBeGreaterThanOrEqual(compactLayout.detailsBottom ?? 0)
  expect(compactLayout.actionBottom).toBe(compactLayout.itemBottom)
  expect(compactLayout.actionsWidth).toBeLessThan((compactLayout.itemWidth ?? 0) / 2)

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()

  await page.goto(groupPath)
  await expect(page).toHaveURL(/\/sign-in$/)

  await page.getByLabel('Email', { exact: true }).fill(account.email)
  await page.getByLabel('Password', { exact: true }).fill('password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  await expect(page).toHaveURL(new RegExp(`${groupPath}$`))
  await expect(page.getByRole('heading', { name: 'House' })).toBeVisible()
})

test('accepted invitees load existing group data', async ({ page }) => {
  const inviteeEmail = `invitee+${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`

  await signIn(page, { name: 'User A' })
  await createGroup(page, { inviteEmails: '' })

  await page.getByRole('button', { name: 'Add entry' }).click()
  const entryDialog = page.getByRole('dialog', { name: 'Add entry' })
  await entryDialog.getByLabel('Amount').fill('45')
  await entryDialog.getByLabel('Description').fill('Groceries')
  await entryDialog.getByRole('button', { name: 'Add entry' }).click()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Groceries')).toBeVisible()

  await page.getByRole('link', { name: 'Manage recurring' }).click()
  await page.getByRole('button', { name: 'Add recurring' }).click()
  const recurringDialog = page.getByRole('dialog', { name: 'Add recurring' })
  await recurringDialog.getByLabel('Title').fill('Weekly rent')
  await recurringDialog.getByLabel('Amount').fill('500')
  await recurringDialog.getByLabel('Start date').fill(toDateInput(new Date()))
  await recurringDialog.getByRole('button', { name: 'Save recurring' }).click()
  await expect(page.getByRole('region', { name: 'Manage recurring' }).getByText('Weekly rent')).toBeVisible()
  await page.getByRole('link', { name: 'Back to group' }).click()
  await expect(page.getByRole('region', { name: 'Recurring' }).getByText('Weekly rent')).toBeVisible()

  await page.getByRole('link', { name: 'Manage shortcuts' }).click()
  await page.getByRole('button', { name: 'Add shortcut' }).click()
  const shortcutDialog = page.getByRole('dialog', { name: 'Add shortcut' })
  await shortcutDialog.getByLabel('Button label').fill('Paid Netflix')
  await shortcutDialog.getByLabel('Category').fill('Entertainment')
  await shortcutDialog.getByLabel('Default amount').fill('22.99')
  await shortcutDialog.getByLabel('Description').fill('User A paid Netflix')
  await shortcutDialog.getByRole('button', { name: 'Save shortcut' }).click()
  await expect(page.getByRole('region', { name: 'Manage shortcuts' }).getByText('Paid Netflix')).toBeVisible()
  await page.getByRole('link', { name: 'Back to group' }).click()

  await page.getByRole('button', { name: 'Invite' }).click()
  const inviteDialog = page.getByRole('dialog', { name: 'Invite member' })
  await inviteDialog.getByLabel('Invite').fill(inviteeEmail)
  await inviteDialog.getByRole('button', { name: 'Invite' }).click()
  await expect(page.getByText('2 people')).toBeVisible()

  await page.goto('/profile')
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)

  await signIn(page, { email: inviteeEmail, name: 'User B' })
  await expect(page.getByRole('button', { name: /navigation/i })).toBeVisible()
  await page.goto('/groups/manage')
  await expect(page.getByRole('region', { name: 'Invitations' }).getByText('House')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Groups' }).getByText('No groups yet')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open House' })).not.toBeVisible()

  await page.getByRole('button', { name: 'Accept' }).click()
  await page.getByRole('link', { name: 'Open House' }).click()

  await expect(page.getByRole('heading', { name: 'House' })).toBeVisible()
  await expect(page.getByText('2 people')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Groceries')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Shortcuts' }).getByRole('button', { name: 'Paid Netflix' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Recurring' }).getByText('Weekly rent')).toBeVisible()
})

test('rejected invitations are consumed without granting group access', async ({ page }) => {
  const inviteeEmail = `rejectee+${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`

  await signIn(page, { name: 'User A' })
  const groupPath = await createGroup(page, { inviteEmails: inviteeEmail })

  await page.goto('/profile')
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)

  await signIn(page, { email: inviteeEmail, name: 'User B' })
  await expect(page.getByRole('button', { name: /navigation/i })).toBeVisible()
  await page.goto('/groups/manage')
  await expect(page.getByRole('region', { name: 'Invitations' }).getByText('House')).toBeVisible()

  await page.getByRole('button', { name: 'Reject' }).click()

  await expect(page.getByRole('region', { name: 'Invitations' })).not.toBeVisible()
  await expect(page.getByRole('region', { name: 'Groups' }).getByText('No groups yet')).toBeVisible()
  const invitationSnapshot = await loadInvitationSnapshot(groupPath, inviteeEmail)

  expect(invitationSnapshot.invitations).toEqual([])
  expect(invitationSnapshot.members).toEqual([])
})

test('entry shortcuts prefill common ledger entries', async ({ page }) => {
  await signIn(page)
  await createGroup(page)
  let delayedShortcutRequest = false

  await page.route('**/functions/v1/ledger', async (route) => {
    const body = route.request().postDataJSON() as { identifier?: string }

    if (!delayedShortcutRequest && body.identifier === 'addEntryShortcut') {
      delayedShortcutRequest = true
      await delay(500)
    }

    await route.continue()
  })

  await page.getByRole('link', { name: 'Manage shortcuts' }).click()
  await expect(page).toHaveURL(/\/groups\/.+\/shortcuts/)
  await expect(page.getByRole('heading', { name: 'Shortcuts' })).toBeVisible()
  await page.getByRole('button', { name: 'Add shortcut' }).click()

  const addShortcut = page.getByRole('dialog', { name: 'Add shortcut' })
  await addShortcut.getByLabel('Button label').fill('Bought groceries')
  await addShortcut.getByLabel('Emoji').fill('🛒')
  await addShortcut.getByLabel('Category').fill('Groceries')
  await addShortcut.getByLabel('Default amount').fill('28.10')
  await addShortcut.getByLabel('Description').fill('Ryan paid for Ronald groceries')
  const saveShortcut = addShortcut.getByRole('button', { name: 'Save shortcut' })

  await saveShortcut.click()
  await expect(addShortcut.getByLabel('Button label')).toHaveValue('Bought groceries')
  await expect(saveShortcut).toBeDisabled()
  await expect(saveShortcut).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByRole('region', { name: 'Manage shortcuts' }).getByText('Bought groceries')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Manage shortcuts' }).getByText('🛒')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Manage shortcuts' }).getByText('$28.10')).toBeVisible()
  await page.getByRole('link', { name: 'Back to group' }).click()

  const shortcuts = page.getByRole('region', { name: 'Shortcuts' })
  const shortcutAction = shortcuts.getByRole('button', { name: 'Bought groceries' })
  await expect(shortcutAction).toBeVisible()
  await expect(shortcutAction.getByText('🛒')).toBeVisible()
  await expect(shortcuts.getByRole('button', { name: 'Delete' })).not.toBeVisible()

  await shortcutAction.click()

  const shortcutEntry = page.getByRole('dialog', { name: 'Bought groceries' })
  await expect(shortcutEntry.getByLabel('Amount')).toBeVisible()
  await expect(shortcutEntry.getByLabel('Amount')).toBeFocused()
  await expect(shortcutEntry.getByLabel('Amount')).toHaveValue('28.10')
  await expect(shortcutEntry.getByLabel('Date')).not.toBeVisible()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('region', { name: 'Balance' }).getByText('$28.10')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Ryan paid for Ronald groceries')).toBeVisible()

  await shortcutAction.click()
  await shortcutEntry.getByRole('button', { name: 'Expand' }).click()
  await expect(shortcutEntry.getByLabel('Date')).toHaveValue(toDateInput(new Date()))
  await expect(shortcutEntry.getByLabel('Amount')).toHaveValue('28.10')
  await expect(shortcutEntry.getByLabel('Category')).toHaveValue('Groceries')
  await expect(shortcutEntry.getByLabel('Description')).toHaveValue('Ryan paid for Ronald groceries')
  await shortcutEntry.getByRole('button', { name: 'Close' }).click()

  await page.getByRole('link', { name: 'Manage shortcuts' }).click()
  const shortcutList = page.getByRole('region', { name: 'Manage shortcuts' })
  page.once('dialog', (dialog) => dialog.dismiss())
  await shortcutList.getByRole('button', { name: 'Delete' }).click()
  await expect(shortcutList.getByText('Bought groceries')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await shortcutList.getByRole('button', { name: 'Delete' }).click()
  await expect(shortcutList.getByText('No shortcuts yet')).toBeVisible()
})

test('recurring rules are implicit ledger entries', async ({ page }) => {
  const account = await signIn(page)
  await createGroup(page)

  const today = toDateInput(new Date())
  const futureDate = toDateInput(addDays(new Date(), 14))
  await page.getByRole('link', { name: 'Manage recurring' }).click()
  await expect(page).toHaveURL(/\/groups\/.+\/recurring/)
  await page.getByRole('button', { name: 'Add recurring' }).click()

  const recurring = page.getByRole('dialog', { name: 'Add recurring' })
  await recurring.getByLabel('Title').fill('Weekly rent')
  await recurring.getByLabel('Amount').fill('500')
  await recurring.getByLabel('Start date').fill(today)
  await recurring.getByRole('button', { name: 'Save recurring' }).click()

  const recurringList = page.getByRole('region', { name: 'Manage recurring' })
  await expect(recurringList.getByText('Weekly rent')).toBeVisible()
  await expect(recurringList.getByText(`-$500.00 weekly, from ${today}`)).toBeVisible()
  await page.getByRole('link', { name: 'Back to group' }).click()

  await expect(page.getByRole('region', { name: 'Recurring' }).getByText('Weekly rent')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Implicit')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Weekly rent')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('1 entry')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('Deficit')).toBeVisible()
  await page.goto(`${new URL(page.url()).pathname}?asOf=${futureDate}`)
  await expect(page.getByRole('button', { name: `As of ${futureDate}` })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('-$1,500.00')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('3 entries')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Hide navigation' }).click()
  await page.getByRole('button', { name: `As of ${futureDate}` }).click()

  const menuBounds = await page.getByRole('group', { name: 'As of options' }).evaluate((menu) => {
    const bounds = menu.getBoundingClientRect()

    return { left: bounds.left, right: bounds.right, viewportWidth: window.innerWidth }
  })

  expect(menuBounds.left).toBeGreaterThanOrEqual(0)
  expect(menuBounds.right).toBeLessThanOrEqual(menuBounds.viewportWidth)

  await page.setViewportSize({ width: 1280, height: 720 })

  const savedStateAfterAdd = await loadGroupSnapshot(account.email, 'House')

  expect(savedStateAfterAdd.entries).toHaveLength(0)
  expect(savedStateAfterAdd.recurringItems).toEqual([{
    amount_cents: -50000,
    id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    start_date: today
  }])

  await page.getByRole('link', { name: 'Manage recurring' }).click()
  await recurringList.getByRole('button', { name: 'Edit' }).click()

  const editRecurring = page.getByRole('dialog', { name: 'Edit recurring' })
  await expect(editRecurring.getByLabel('Amount')).toHaveValue('500')
  await editRecurring.getByLabel('Amount').fill('600')
  await editRecurring.getByRole('button', { name: 'Save recurring' }).click()

  await expect(recurringList.getByText(`-$600.00 weekly, from ${today}`)).toBeVisible()
  await page.getByRole('link', { name: 'Back to group' }).click()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('-$600.00')).toBeVisible()
  await page.goto(`${new URL(page.url()).pathname}?asOf=${futureDate}`)
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('-$1,800.00')).toBeVisible()

  const savedStateAfterEdit = await loadGroupSnapshot(account.email, 'House')

  expect(savedStateAfterEdit.recurringItems).toMatchObject([{ amount_cents: -60000 }])

  await page.getByRole('link', { name: 'Manage recurring' }).click()
  page.once('dialog', (dialog) => dialog.dismiss())
  await recurringList.getByRole('button', { name: 'Delete' }).click()
  await expect(recurringList.getByText('Weekly rent')).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await recurringList.getByRole('button', { name: 'Delete' }).click()

  await expect(recurringList.getByText('No recurring rules')).toBeVisible()
  await page.getByRole('link', { name: 'Back to group' }).click()
  await expect(page.getByRole('region', { name: 'Recurring' }).getByText('No recurring rules')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('Balanced')).toBeVisible()
})
