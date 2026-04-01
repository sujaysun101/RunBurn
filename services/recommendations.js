const Anthropic = require("@anthropic-ai/sdk");
const { getServiceRoleClient } = require("./db");

function hasCacheMiss(steps = []) {
  const normalized = steps.map((step) => JSON.stringify(step).toLowerCase());
  const installsDeps = normalized.some((value) => value.includes("npm install") || value.includes("pip install"));
  const hasCache = normalized.some((value) => value.includes("cache") || value.includes("actions/cache"));
  return installsDeps && !hasCache;
}

function estimateSeverity(savings) {
  if (savings > 100) return "CRITICAL";
  if (savings >= 20) return "WARNING";
  return "INFO";
}

async function detectPatterns(supabase, installationId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: runs, error: runsError }, { data: jobs, error: jobsError }] = await Promise.all([
    supabase
      .from("workflow_runs")
      .select("id, repo_name, workflow_name, run_attempt, head_branch, runner_os, estimated_cost_usd, created_at")
      .eq("installation_id", installationId)
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("workflow_jobs")
      .select("run_id, steps")
  ]);

  if (runsError) throw runsError;
  if (jobsError) throw jobsError;

  const jobsByRunId = new Map((jobs || []).map((job) => [job.run_id, job.steps || []]));
  const grouped = new Map();

  for (const run of runs || []) {
    const key = `${run.repo_name}::${run.workflow_name}`;
    const current = grouped.get(key) || {
      repo_name: run.repo_name,
      workflow_name: run.workflow_name,
      totalRuns: 0,
      reruns: 0,
      macRuns: 0,
      branchRuns: 0,
      branchOverreachRuns: 0,
      totalCost: 0,
      noCache: false
    };

    current.totalRuns += 1;
    current.totalCost += Number(run.estimated_cost_usd || 0);
    if (Number(run.run_attempt || 1) > 1) current.reruns += 1;
    if ((run.runner_os || "").toLowerCase().includes("mac")) current.macRuns += 1;
    if (run.head_branch) {
      current.branchRuns += 1;
      if (!["main", "master", "develop", "development"].includes(run.head_branch)) {
        current.branchOverreachRuns += 1;
      }
    }
    if (hasCacheMiss(jobsByRunId.get(run.id))) {
      current.noCache = true;
    }

    grouped.set(key, current);
  }

  const patterns = [];

  for (const entry of grouped.values()) {
    const rerunRate = entry.totalRuns > 0 ? entry.reruns / entry.totalRuns : 0;
    const macRate = entry.totalRuns > 0 ? entry.macRuns / entry.totalRuns : 0;
    const branchRate = entry.branchRuns > 0 ? entry.branchOverreachRuns / entry.branchRuns : 0;

    if (rerunRate > 0.2) {
      patterns.push({
        type: "FLAKY_TESTS",
        ...entry,
        estimated_monthly_savings_usd: Number((entry.totalCost * 0.25).toFixed(2))
      });
    }

    if (macRate > 0.5) {
      patterns.push({
        type: "EXPENSIVE_RUNNER",
        ...entry,
        estimated_monthly_savings_usd: Number((entry.totalCost * 0.45).toFixed(2))
      });
    }

    if (entry.noCache) {
      patterns.push({
        type: "NO_CACHE",
        ...entry,
        estimated_monthly_savings_usd: Number((entry.totalCost * 0.18).toFixed(2))
      });
    }

    if (branchRate > 0.6) {
      patterns.push({
        type: "BRANCH_OVERREACH",
        ...entry,
        estimated_monthly_savings_usd: Number((entry.totalCost * 0.22).toFixed(2))
      });
    }
  }

  return patterns;
}

async function generateRecommendation(pattern) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        title: `${pattern.type.replace(/_/g, " ")} detected`,
        description: `Runburn found a ${pattern.type.toLowerCase().replace(/_/g, " ")} pattern in ${pattern.workflow_name}. Review the suggested YAML changes and validate them against your workflow logic.`,
        estimated_monthly_savings_usd: pattern.estimated_monthly_savings_usd,
        yaml_patch: `before:\n  runs-on: macos-latest\nafter:\n  runs-on: ubuntu-latest`
      };
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 900,
      system: "You are a senior DevOps engineer specializing in GitHub Actions cost optimization. You write clear, actionable recommendations with exact YAML patches. Be specific about line numbers and changes. Always provide a before/after YAML snippet. Return JSON only.",
      messages: [
        {
          role: "user",
          content: `Here is a GitHub Actions workflow pattern I detected: ${JSON.stringify(pattern)}. Generate a recommendation with: (1) title (10 words max), (2) description of the problem (2 sentences), (3) estimated monthly savings in USD, (4) a yaml_patch showing exactly what to change (before/after format). Return JSON only.`
        }
      ]
    });

    const text = response.content.find((item) => item.type === "text")?.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Anthropic recommendation generation failed: ${error.message}`);
  }
}

async function storeRecommendation(supabase, installationId, pattern, recommendation) {
  const dedupeWindow = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("cost_recommendations")
    .select("id")
    .eq("installation_id", installationId)
    .eq("repo_name", pattern.repo_name)
    .eq("workflow_name", pattern.workflow_name)
    .eq("recommendation_type", pattern.type)
    .gte("created_at", dedupeWindow)
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (existing && existing.length > 0) {
    return null;
  }

  const { error } = await supabase.from("cost_recommendations").insert({
    installation_id: installationId,
    repo_name: pattern.repo_name,
    workflow_name: pattern.workflow_name,
    recommendation_type: pattern.type,
    severity: estimateSeverity(pattern.estimated_monthly_savings_usd),
    title: recommendation.title,
    description: recommendation.description,
    estimated_monthly_savings_usd: recommendation.estimated_monthly_savings_usd,
    yaml_patch: recommendation.yaml_patch
  });

  if (error) {
    throw error;
  }
}

async function runRecommendationEngine(installationId) {
  const supabase = await getServiceRoleClient();

  try {
    const patterns = await detectPatterns(supabase, installationId);

    for (const pattern of patterns) {
      const recommendation = await generateRecommendation(pattern);
      await storeRecommendation(supabase, installationId, pattern, recommendation);
    }
  } catch (error) {
    throw new Error(`Recommendation engine failed: ${error.message}`);
  }
}

module.exports = {
  runRecommendationEngine,
  detectPatterns
};
