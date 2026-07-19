import type { Account } from '../../types/auth'

export const getProfileButtonLabel = (account?: Account) => (
  account?.name?.trim() || account?.email?.trim() || 'Profile'
)
