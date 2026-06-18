const corsHeaders = (request: Request) => {
  const configuredOrigin = Deno.env.get('FRIENDLY_LEDGER_ALLOWED_ORIGIN') ?? '*'
  const requestOrigin = request.headers.get('origin') ?? '*'
  const origin = configuredOrigin === '*' ? requestOrigin : configuredOrigin

  return {
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-origin': origin,
    'vary': 'origin'
  }
}

Deno.serve((request) => {
  const headers = corsHeaders(request)

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: {
        ...headers,
        'content-type': 'application/json; charset=utf-8'
      },
      status: 405
    })
  }

  return new Response(
    JSON.stringify({
      ok: true,
      app: 'friendly-ledger',
      environment: Deno.env.get('FRIENDLY_LEDGER_ENVIRONMENT') ?? 'local'
    }),
    {
      headers: {
        ...headers,
        'content-type': 'application/json; charset=utf-8'
      }
    }
  )
})
