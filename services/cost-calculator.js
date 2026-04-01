const RATE_CARD = {
  ubuntu: 0.008,
  windows: 0.016,
  macos: 0.08,
  "ubuntu-4-core": 0.016,
  "ubuntu-8-core": 0.032,
  "ubuntu-16-core": 0.064,
  "macos-12-core-m1": 0.16
};

function roundUsd(value) {
  return Number(value.toFixed(6));
}

function calculateRunCost(run) {
  const ubuntuCost = (Number(run.billable_ms_ubuntu || 0) / 60000) * RATE_CARD.ubuntu;
  const macCost = (Number(run.billable_ms_macos || 0) / 60000) * RATE_CARD.macos;
  const windowsCost = (Number(run.billable_ms_windows || 0) / 60000) * RATE_CARD.windows;

  return roundUsd(ubuntuCost + macCost + windowsCost);
}

async function getMonthlySpend(supabase, installationId, month) {
  try {
    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const monthEnd = new Date(monthStart);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);

    const { data, error } = await supabase
      .from("workflow_runs")
      .select("repo_name, workflow_name, runner_os, estimated_cost_usd, duration_seconds")
      .eq("installation_id", installationId)
      .gte("started_at", monthStart.toISOString())
      .lt("started_at", monthEnd.toISOString());

    if (error) {
      throw error;
    }

    const grouped = new Map();

    for (const row of data || []) {
      const key = `${row.repo_name}::${row.workflow_name}::${row.runner_os || "unknown"}`;
      const current = grouped.get(key) || {
        repo_name: row.repo_name,
        workflow_name: row.workflow_name,
        runner_os: row.runner_os || "unknown",
        total_cost_usd: 0,
        total_duration_seconds: 0,
        run_count: 0
      };

      current.total_cost_usd += Number(row.estimated_cost_usd || 0);
      current.total_duration_seconds += Number(row.duration_seconds || 0);
      current.run_count += 1;
      grouped.set(key, current);
    }

    return Array.from(grouped.values())
      .map((entry) => ({
        ...entry,
        total_cost_usd: roundUsd(entry.total_cost_usd)
      }))
      .sort((a, b) => b.total_cost_usd - a.total_cost_usd);
  } catch (error) {
    throw new Error(`Failed to compute monthly spend: ${error.message}`);
  }
}

module.exports = {
  RATE_CARD,
  calculateRunCost,
  getMonthlySpend
};
