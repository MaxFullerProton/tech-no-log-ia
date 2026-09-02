# Company Client Runtime

Reusable owner-only Sites runtime for a canonical Company. Client identity is
derived only from trusted Sites headers. Operational records use the shared
Supabase Company gateway with per-Site credentials, Company/type allowlists,
Human ownership, idempotency, optimistic concurrency and atomic event writing.

The default candidate accepts only non-sensitive or synthetic inputs. It does
not authorize production, sales, payments, regulated fulfillment or PHI.

## Checks

`npm test`, `npm run lint`, `npm run typecheck` and `npm run build`.
