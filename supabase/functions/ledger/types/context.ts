import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2'

export type LedgerInvocationContext = {
  client: SupabaseClient
  user: User
}
