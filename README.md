# Runburn

Runburn is a GitHub Actions Cost Intelligence Dashboard that connects to a GitHub organization, ingests workflow run data, prices CI usage in real dollars, detects wasteful patterns, and generates AI-backed YAML recommendations to cut spend.

## Stack
- Backend: Node.js + Express
- Frontend: Next.js 14 App Router + Tailwind CSS + shadcn-style UI + Recharts
- Database/Auth: Supabase Postgres + Supabase Auth with GitHub OAuth
- GitHub integration: `@octokit/app`, `@octokit/rest`
- AI recommendations: Anthropic `claude-sonnet-4-20250514`

## Quick Start
1. Copy `.env.example` to `.env` and fill in GitHub, Supabase, and Anthropic credentials.
2. Run the SQL in [supabase/migrations/001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql).
3. Install dependencies:
   - `npm install`
   - `npm --prefix dashboard install`
4. Start both services with `npm run dev`.

## GitHub App Registration
1. Open [GitHub App manifest registration](https://github.com/settings/apps/new?state=runburn).
2. Paste the contents of [app.yml](./app.yml).
3. Set the webhook URL to:
   - Local API: `https://your-tunnel/webhook`
   - Vercel dashboard: `https://your-domain/api/webhook`
4. Copy the generated App ID, private key, and webhook secret into `.env`.

## Supabase Auth
- Enable GitHub as an OAuth provider in Supabase Auth.
- Set the callback URL to `https://your-domain/auth/callback`.
- Provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the dashboard.

## Plans
- Free: 1 org, 5 repos tracked, 30-day history, no AI recommendations
- Pro: unlimited repos, 12-month history, AI recommendations, team breakdown, CSV export

The dashboard middleware checks the stored installation plan before serving `/dashboard/recommendations`.

## GitHub Developer Program
Runburn uses GitHub Webhooks, the Actions REST API, Organizations API, and Repositories API. That platform usage qualifies the project for GitHub Developer Program membership.

When applying:
1. Publish the repository publicly with this README and [docs/github-app.md](./docs/github-app.md).
2. Register the production GitHub App from [app.yml](./app.yml).
3. Reference the product as a GitHub-integrated developer tool in your application.

Suggested badge language:
`Built with the GitHub platform for the GitHub Developer Program.`

## Deployment
- Express backend can run as a single service on Railway or Render via `node server.js`.
- The `dashboard/` directory is Vercel-ready and imports shared server modules through `experimental.externalDir`.
- Set the Vercel project root to `dashboard/` and mirror the environment variables from `.env.example`.
