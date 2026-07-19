import { describe, expect, it } from 'vitest'
import { getProfileButtonLabel } from '../../../../src/components/FriendlyLedgerFrame/profileButtonLabel'
import type { Account } from '../../../../src/types/auth'

const account = (overrides: Partial<Account>): Account => ({
  id: 'account_1',
  name: 'Ryan Hayward',
  email: 'ryan@example.com',
  createdDate: '2026-07-20',
  ...overrides
})

describe('profile button label', () => {
  it('prefers a trimmed account name', () => {
    expect(getProfileButtonLabel(account({
      name: '  Ryan Hayward  ',
      email: 'ryan@example.com'
    }))).toBe('Ryan Hayward')
  })

  it('falls back to email when the account name is blank', () => {
    expect(getProfileButtonLabel(account({
      name: '   ',
      email: 'ryan@example.com'
    }))).toBe('ryan@example.com')
  })

  it('falls back to Profile when no usable account value exists', () => {
    expect(getProfileButtonLabel()).toBe('Profile')
    expect(getProfileButtonLabel(account({
      name: '',
      email: '   '
    }))).toBe('Profile')
  })
})
