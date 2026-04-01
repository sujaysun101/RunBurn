const crypto = require("crypto");
const { getServiceRoleClient } = require("../services/db");
const { getInstallationOctokit } = require("../services/github-client");
const { calculateRunCost } = require("../services/cost-calculator");
const { queue } = require("../services/queue");
const { runRecommendationEngine } = require("../services/recommendations");

function verifyWebhookSignature({ rawBody, signature, secret }) {
  if (!signature || !secret) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(`sha256=${hmac.update(rawBody).digest("hex")}`, "utf8");
  const checksum = Buffer.from(signature, "utf8");

  if (digest.length !== checksum.length) {
    return false;
  }

  return crypto.timingSafeEqual(digest, checksum);
}

function inferRunnerOs(jobs) {
  const sample = `${jobs?.[0]?.runner_name || ""} ${(jobs?.[0]?.labels || []).join(" ")}`.toLowerCase();
  if (sample.includes("mac")) return "macos";
  if (sample.includes("windows")) return "windows";
  return "ubuntu";
}

async function persistWorkflowData({ supabase, installationId, payload, run, jobs, timing }) {
  const runRow = {
    installation_id: installationId,
    repo_name: payload.repository.name,
    repo_full_name: payload.repository.full_name,
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
    duration_seconds: Math.max(0, Math.round((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000)),
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
    triggered_by: run.actor?.login || payload.sender?.login || "unknown"
  };

  const { data: savedRun, error: runError } = await supabase
    .from("workflow_runs")
    .upsert(runRow, { onConflict: "run_id" })
    .select("id")
    .single();

  if (runError) {
    throw runError;
  }

  const jobRows = (jobs || []).map((job) => ({
    run_id: savedRun.id,
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

async function processWorkflowRunEvent(payload) {
  if (payload.action !== "completed" || !payload.installation?.id) {
    return { ignored: true };
  }

  try {
    const installationId = Number(payload.installation.id);
    const supabase = await getServiceRoleClient();
    const octokit = await getInstallationOctokit(installationId);
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const runId = payload.workflow_run.id;

    const [{ data: run }, { data: timing }, { data: jobsResponse }] = await Promise.all([
      octokit.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}", {
        owner,
        repo,
        run_id: runId
      }),
      octokit.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing", {
        owner,
        repo,
        run_id: runId
      }),
      octokit.request("GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs", {
        owner,
        repo,
        run_id: runId
      })
    ]);

    const { data: installationRow, error: installationError } = await supabase
      .from("installations")
      .select("id")
      .eq("github_installation_id", installationId)
      .single();

    if (installationError) {
      throw installationError;
    }

    await persistWorkflowData({
      supabase,
      installationId: installationRow.id,
      payload,
      run,
      jobs: jobsResponse.jobs || [],
      timing
    });

    if (Number(run.run_attempt || 1) > 2) {
      console.info("[runburn] potential flaky run detected", {
        repo: payload.repository.full_name,
        workflow: run.name,
        runId
      });
    }

    queue.enqueue(async () => {
      const { count, error } = await supabase
        .from("workflow_runs")
        .select("*", { count: "exact", head: true })
        .eq("installation_id", installationRow.id);

      if (error) {
        throw error;
      }

      if (count && count % 50 === 0) {
        await runRecommendationEngine(installationRow.id);
      }
    });

    return { ignored: false };
  } catch (error) {
    throw new Error(`Workflow run ingestion failed: ${error.message}`);
  }
}

async function handleWebhookRequest({ headers, rawBody }) {
  const event = headers["x-github-event"];
  const signature = headers["x-hub-signature-256"];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!verifyWebhookSignature({ rawBody, signature, secret })) {
    throw new Error("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody.toString("utf8"));

  if (event === "workflow_run") {
    return processWorkflowRunEvent(payload);
  }

  return { ignored: true };
}

async function expressWebhookHandler(req, res) {
  try {
    await handleWebhookRequest({
      headers: req.headers,
      rawBody: req.rawBody
    });
  } catch (error) {
    console.error("[webhook] processing error", {
      message: error.message
    });
  } finally {
    res.status(200).json({ ok: true });
  }
}

module.exports = {
  handleWebhookRequest,
  expressWebhookHandler,
  verifyWebhookSignature
};
