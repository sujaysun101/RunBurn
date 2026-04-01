const { getServiceRoleClient } = require("./db");
const { getInstallationOctokit, paginateWithDelay, sleep } = require("./github-client");
const { calculateRunCost } = require("./cost-calculator");

async function updateBackfillStatus(supabase, installationId, backfillStatus) {
  const { error } = await supabase
    .from("installations")
    .update({ backfill_status: backfillStatus })
    .eq("id", installationId);

  if (error) {
    throw error;
  }
}

function inferRunnerOs(jobs) {
  const runnerName = (jobs?.[0]?.runner_name || "").toLowerCase();
  if (runnerName.includes("mac")) return "macos";
  if (runnerName.includes("windows")) return "windows";
  return "ubuntu";
}

async function persistRunWithJobs({ supabase, installationId, repo, run, jobs, timing }) {
  const payload = {
    installation_id: installationId,
    repo_name: repo.name,
    repo_full_name: repo.full_name,
    workflow_id: run.workflow_id,
    workflow_name: run.name,
    workflow_path: run.path,
    run_id: run.id,
    run_number: run.run_number,
    run_attempt: run.run_attempt,
    head_branch: run.head_branch,
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    started_at: run.run_started_at,
    completed_at: run.updated_at,
    duration_seconds: Math.max(
      0,
      Math.round((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000)
    ),
    runner_os: inferRunnerOs(jobs),
    runner_type: jobs?.[0]?.labels?.join(", ") || "standard",
    billable_ms_ubuntu: timing?.billable?.UBUNTU?.total_ms || 0,
    billable_ms_macos: timing?.billable?.MACOS?.total_ms || 0,
    billable_ms_windows: timing?.billable?.WINDOWS?.total_ms || 0,
    estimated_cost_usd: calculateRunCost({
      billable_ms_ubuntu: timing?.billable?.UBUNTU?.total_ms || 0,
      billable_ms_macos: timing?.billable?.MACOS?.total_ms || 0,
      billable_ms_windows: timing?.billable?.WINDOWS?.total_ms || 0
    }),
    triggered_by: run.actor?.login || "unknown"
  };

  const { data, error } = await supabase
    .from("workflow_runs")
    .upsert(payload, { onConflict: "run_id" })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  const jobRows = (jobs || []).map((job) => ({
    run_id: data.id,
    job_id: job.id,
    job_name: job.name,
    runner_name: job.runner_name,
    runner_os: inferRunnerOs([job]),
    started_at: job.started_at,
    completed_at: job.completed_at,
    duration_seconds: job.started_at && job.completed_at
      ? Math.max(0, Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000))
      : 0,
    billable_ms: job.started_at && job.completed_at
      ? Math.max(0, new Date(job.completed_at).getTime() - new Date(job.started_at).getTime())
      : 0,
    conclusion: job.conclusion,
    steps: job.steps || []
  }));

  if (jobRows.length > 0) {
    const { error: jobsError } = await supabase
      .from("workflow_jobs")
      .upsert(jobRows, { onConflict: "job_id" });

    if (jobsError) {
      throw jobsError;
    }
  }
}

async function backfillInstallation({ installationId, orgLogin }) {
  const supabase = await getServiceRoleClient();

  try {
    await updateBackfillStatus(supabase, installationId, "running");
    const octokit = await getInstallationOctokit(installationId);
    const repos = await paginateWithDelay(octokit, "GET /orgs/{org}/repos", { org: orgLogin });
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    for (const repo of repos) {
      const runs = await paginateWithDelay(octokit, "GET /repos/{owner}/{repo}/actions/runs", {
        owner: repo.owner.login,
        repo: repo.name,
        created: `>=${since}`
      });

      for (const run of runs) {
        const [{ data: timing }, { data: jobsResponse }] = await Promise.all([
          octokit.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing", {
            owner: repo.owner.login,
            repo: repo.name,
            run_id: run.id
          }),
          octokit.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs", {
            owner: repo.owner.login,
            repo: repo.name,
            run_id: run.id
          })
        ]);

        await persistRunWithJobs({
          supabase,
          installationId,
          repo,
          run,
          jobs: jobsResponse.jobs || [],
          timing
        });

        await sleep(100);
      }
    }

    await updateBackfillStatus(supabase, installationId, "complete");
  } catch (error) {
    await updateBackfillStatus(supabase, installationId, "pending").catch(() => {});
    throw new Error(`Backfill failed: ${error.message}`);
  }
}

module.exports = {
  backfillInstallation
};
