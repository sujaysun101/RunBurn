create extension if not exists "pgcrypto";

create table if not exists installations (
  id uuid primary key default gen_random_uuid(),
  github_installation_id bigint unique not null,
  org_login text not null,
  org_avatar_url text,
  plan text not null default 'free',
  backfill_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists workflow_runs (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references installations(id) on delete cascade,
  repo_name text not null,
  repo_full_name text not null,
  workflow_id bigint,
  workflow_name text not null,
  workflow_path text,
  run_id bigint unique not null,
  run_number int,
  run_attempt int,
  head_branch text,
  event text,
  status text,
  conclusion text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds int,
  runner_os text,
  runner_type text,
  billable_ms_ubuntu bigint not null default 0,
  billable_ms_macos bigint not null default 0,
  billable_ms_windows bigint not null default 0,
  estimated_cost_usd numeric(10, 6) not null default 0,
  triggered_by text,
  created_at timestamptz not null default now()
);

create table if not exists workflow_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references workflow_runs(id) on delete cascade,
  job_id bigint unique not null,
  job_name text not null,
  runner_name text,
  runner_os text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds int,
  billable_ms bigint,
  conclusion text,
  steps jsonb not null default '[]'::jsonb
);

create table if not exists cost_recommendations (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null references installations(id) on delete cascade,
  repo_name text not null,
  workflow_name text not null,
  recommendation_type text not null,
  severity text not null,
  title text not null,
  description text not null,
  estimated_monthly_savings_usd numeric(8, 2) not null default 0,
  yaml_patch text not null,
  created_at timestamptz not null default now(),
  is_dismissed boolean not null default false
);

create index if not exists idx_workflow_runs_installation_started_at
  on workflow_runs (installation_id, started_at desc);

create index if not exists idx_workflow_runs_repo_workflow
  on workflow_runs (repo_name, workflow_name);

create index if not exists idx_recommendations_installation_created_at
  on cost_recommendations (installation_id, created_at desc);
