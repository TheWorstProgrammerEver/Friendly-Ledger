import { expect, test, type Page } from '@playwright/test'

const pad = (value: number) => value.toString().padStart(2, '0')

const toDateInput = (date: Date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
)

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

const signIn = async (page: Page) => {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Friendly Ledger' })).toBeVisible()
  await page.getByLabel('Email').fill('ryan@example.com')
  await expect(page.getByLabel('Name')).toBeVisible()
  await page.getByLabel('Name').fill('Ryan')
  await page.getByLabel('Password').fill('noop')
  await page.getByRole('button', { name: 'Create account' }).click()
}

const createGroup = async (page: Page) => {
  await expect(page.getByRole('heading', { name: 'Manage Groups' })).toBeVisible()
  await page.getByRole('button', { name: 'Create group' }).click()

  const createGroupDialog = page.getByRole('dialog', { name: 'Create group' })
  await createGroupDialog.getByLabel('Group name').fill('House')
  await createGroupDialog.getByLabel('Invite emails').fill('sam@example.com')
  await createGroupDialog.getByRole('button', { name: 'Create group' }).click()
  await expect(page.getByRole('heading', { name: 'House' })).toBeVisible()
}

test('creates a group and records a ledger entry', async ({ page }) => {
  await signIn(page)
  await createGroup(page)

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
})

test('recurring rules are implicit ledger entries', async ({ page }) => {
  await signIn(page)
  await createGroup(page)

  const today = toDateInput(new Date())
  const futureDate = toDateInput(addDays(new Date(), 14))
  await page.getByRole('button', { name: 'Add recurring' }).click()

  const recurring = page.getByRole('dialog', { name: 'Add recurring' })
  await recurring.getByLabel('Title').fill('Weekly rent')
  await recurring.getByLabel('Amount').fill('500')
  await recurring.getByLabel('Start date').fill(today)
  await recurring.getByRole('button', { name: 'Save recurring' }).click()

  const savedStateAfterAdd = await page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('friendly-ledger-state-v2') ?? '{}')
    const group = state.groups.find((candidate: { name: string }) => candidate.name === 'House')

    return {
      entryCount: group.entries.length,
      recurringCount: group.recurringItems.length,
      recurringAmountCents: group.recurringItems[0].amountCents,
      recurringStartDate: group.recurringItems[0].startDate
    }
  })

  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Implicit')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Entries' }).getByText('Weekly rent')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('Deficit')).toBeVisible()
  await page.getByLabel('As of').fill(futureDate)
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('-$1,500.00')).toBeVisible()
  expect(savedStateAfterAdd).toEqual({
    entryCount: 0,
    recurringCount: 1,
    recurringAmountCents: -50000,
    recurringStartDate: today
  })

  await page.getByRole('button', { name: 'Edit' }).click()

  const editRecurring = page.getByRole('dialog', { name: 'Edit recurring' })
  await expect(editRecurring.getByLabel('Amount')).toHaveValue('500')
  await editRecurring.getByLabel('Amount').fill('600')
  await editRecurring.getByRole('button', { name: 'Save recurring' }).click()

  await expect(page.getByRole('region', { name: 'Balance' }).getByText('-$1,800.00')).toBeVisible()

  const savedStateAfterEdit = await page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('friendly-ledger-state-v2') ?? '{}')
    const group = state.groups.find((candidate: { name: string }) => candidate.name === 'House')

    return {
      recurringCount: group.recurringItems.length,
      recurringAmountCents: group.recurringItems[0].amountCents
    }
  })

  expect(savedStateAfterEdit).toEqual({
    recurringCount: 1,
    recurringAmountCents: -60000
  })

  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByRole('dialog', { name: 'Edit recurring' }).getByRole('button', { name: 'Delete' }).click()

  await expect(page.getByRole('region', { name: 'Recurring' }).getByText('No recurring rules')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Balance' }).getByText('Balanced')).toBeVisible()
})
