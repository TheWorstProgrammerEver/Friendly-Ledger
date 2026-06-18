import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2'
import { nameFromEmail, normalizeEmail, todayIso } from './helpers.ts'

type ProfileRow = {
  id: string
  display_name: string
  email: string
  created_date: string
}

const metadataName = (user: User) => {
  const displayName = user.user_metadata?.display_name

  return typeof displayName === 'string' ? displayName.trim() : ''
}

export const getProfile = async (client: SupabaseClient, user: User) => {
  const email = normalizeEmail(user.email ?? '')
  const fallbackName = metadataName(user) || nameFromEmail(email)
  const { data: existingProfile, error: selectError } = await client
    .from('profiles')
    .select('id, display_name, email, created_date')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>()

  if (selectError) {
    throw selectError
  }

  if (existingProfile) {
    return existingProfile
  }

  const { error: insertError } = await client
    .from('profiles')
    .insert({
      id: user.id,
      display_name: fallbackName,
      email
    })

  if (insertError) {
    throw insertError
  }

  return {
    id: user.id,
    display_name: fallbackName,
    email,
    created_date: todayIso()
  }
}
