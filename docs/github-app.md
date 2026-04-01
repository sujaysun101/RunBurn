# GitHub App Integration

Runburn integrates with GitHub through a GitHub App configured from [`app.yml`](../app.yml).

## Permissions
- `Actions: Read` for workflow runs, jobs, timing, and usage data
- `Administration: Read` for organization-level billing signals
- `Metadata: Read` for repository identity
- `Members: Read` for org and team attribution

## Webhooks
- `workflow_run`
- `workflow_job`

Webhook targets:
- Local Express: `POST /webhook`
- Vercel dashboard route: `POST /api/webhook`

## Ingestion Flow
1. Verify the `x-hub-signature-256` signature with `crypto.timingSafeEqual`
2. On `workflow_run.completed`, fetch run details, billable timing, and jobs
3. Compute estimated USD cost and persist runs/jobs into Supabase
4. Queue recommendation analysis after ingestion

## APIs Used
- Webhooks API
- Actions REST API (`runs`, `jobs`, `timing`)
- Organizations API
- Repositories API

These integrations qualify Runburn for GitHub Developer Program membership when paired with public documentation and a production registration.
