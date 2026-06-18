# Supabase

Friendly Ledger uses Supabase for auth and ledger persistence. The React app talks to a small Edge Function API rather than writing ledger rows directly.

## Local Commands

Run the stack:

```sh
npm run supabase:start
```

Inspect local URLs and keys:

```sh
npm run supabase:status
```

Reset the local database from migrations and seed:

```sh
npm run supabase:reset
```

Generate a migration from changes made in the local Supabase UI:

```sh
npm run supabase:migration -- add_some_change
```

This runs `supabase db diff --local --file add_some_change` and writes a timestamped migration under `supabase/migrations`.

Serve Edge Functions locally:

```sh
npm run supabase:functions:serve
```

The `ledger-health` function is public locally and should respond at:

```txt
http://127.0.0.1:54321/functions/v1/ledger-health
```

Stop the stack:

```sh
npm run supabase:stop
```

## Shape

Curate used Supabase as a transactional database boundary: SQL migrations, RLS on app tables, helper predicates, and TypeScript wrappers around `client.rpc(...)`. Friendly Ledger keeps that access-control posture, but puts app commands behind Edge Functions for now.

Current split:

- Database migrations define the durable ledger model and RLS policy helpers.
- Recurring items are stored as configurations, not generated ledger-entry rows.
- The `ledger` Edge Function owns ledger commands and returns refreshed group state after each mutation.
- The function uses the caller's JWT when querying Supabase, so table RLS remains the final access-control layer.
- Service-role grants exist for local/test administration and cleanup, not browser access.
- Browser runtime configuration is loaded by `public/config.js` from JSON payloads. Local development uses generated, ignored `public/config.local.json`; deploys should substitute committed `public/config.json`.

## Environment Promotion

The React bundle should continue using runtime config rather than Vite build-time env vars:

- `#{SUPABASE_URL}#`
- `#{SUPABASE_PUBLISHABLE_KEY}#`
- `#{ENVIRONMENT}#`
- `#{BUILD_VERSION}#`
- `#{AUTH_EMAIL_PASSWORD_ENABLED}#`
- `#{AUTH_OTP_ENABLED}#`
- `#{AUTH_MAGIC_LINK_ENABLED}#`
- optionally `#{CONFIG_FILE}#` in `public/config.js` if a deploy needs to load a non-default JSON config path

That gives test and production the same build artifact with environment-specific values replaced at deployment time.
