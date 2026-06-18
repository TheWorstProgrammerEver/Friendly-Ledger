import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { HttpError } from './helpers.ts'

export const corsHeaders = (request: Request) => {
  const configuredOrigin = Deno.env.get('FRIENDLY_LEDGER_ALLOWED_ORIGIN') ?? '*'
  const requestOrigin = request.headers.get('origin') ?? '*'
  const origin = configuredOrigin === '*' ? requestOrigin : configuredOrigin

  return {
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-origin': origin,
    'vary': 'origin'
  }
}

export const jsonResponse = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), {
  headers: {
    ...corsHeaders(request),
    'content-type': 'application/json; charset=utf-8'
  },
  status
})

const getSupabaseConfig = () => {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')

  if (!url || !key) {
    throw new HttpError(500, 'Supabase function environment is missing.')
  }

  return { url, key }
}

export const createUserClient = (authorization: string) => {
  const { url, key } = getSupabaseConfig()

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: authorization
      }
    }
  })
}

export const requireUser = async (client: SupabaseClient) => {
  const { data, error } = await client.auth.getUser()

  if (error || !data.user) {
    throw new HttpError(401, 'Sign in before using the ledger.')
  }

  return data.user
}
