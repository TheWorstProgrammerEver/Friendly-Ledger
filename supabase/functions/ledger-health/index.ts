import { withSupabase } from 'npm:@supabase/server@^1'

export default {
  fetch: withSupabase({ auth: 'none' }, async (request) => {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    return Response.json({
      ok: true,
      app: 'friendly-ledger',
      environment: Deno.env.get('FRIENDLY_LEDGER_ENVIRONMENT') ?? 'local'
    })
  })
}
