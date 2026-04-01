# Runburn Conventions

## Product
- Runburn is a GitHub Actions cost intelligence dashboard for engineering teams.
- Optimize for operational clarity over marketing-heavy UI.
- Preserve the canonical data model in `supabase/migrations/001_initial_schema.sql`.

## Architecture
- Root files contain backend and shared ingestion logic.
- `dashboard/` contains the Next.js 14 App Router frontend and Vercel-ready route handlers.
- Shared server logic should stay reusable so Express and Next route handlers can import the same modules.

## Environment
- Copy `.env.example` to `.env` at the repo root for backend jobs.
- Copy the same public Supabase values into `dashboard/.env.local` for local dashboard work when needed.
- Never log GitHub tokens, private keys, or Anthropic credentials.

## File Structure
- `handlers/` for webhook/event adapters.
- `services/` for data ingestion, GitHub API access, recommendation generation, and shared infra helpers.
- `dashboard/components/` for UI composition.
- `dashboard/lib/` for auth, Supabase helpers, and dashboard data access.
- `docs/` for GitHub App and integration docs.

## Coding Rules
- Wrap async work in `try/catch` and surface actionable error messages.
- Keep GitHub webhook responses fast; background heavy work through the in-memory queue.
- Prefer server components for dashboard pages unless interactivity or charts require client components.
- Sort time-series data chronologically before rendering charts.
- Use semantic Tailwind tokens and restrained dashboard styling.

## Deployment Notes
- Local and single-service deploys use `server.js`.
- Vercel deploys use the `dashboard/` app as the project root and can call shared logic via `experimental.externalDir`.
