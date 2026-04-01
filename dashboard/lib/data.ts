import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const mockOverview = {
  installation: {
    id: "mock-installation",
    org_login: "runburn-demo",
    org_avatar_url: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
    plan: "pro"
  },
  metrics: [
    { label: "Total Spend This Month", value: 1842.33, hint: "+12.4% vs last month" },
    { label: "Projected Month-End", value: 2310.45, hint: "Based on daily pacing" },
    { label: "Wasted Spend", value: 318.2, hint: "Flaky reruns and failed no-change runs" },
    { label: "Potential Savings", value: 486, hint: "Active recommendations" }
  ],
  dailySpend: ([
    ["2026-03-03", 41], ["2026-03-04", 35], ["2026-03-05", 53], ["2026-03-06", 49],
    ["2026-03-07", 62], ["2026-03-08", 58], ["2026-03-09", 77], ["2026-03-10", 66],
    ["2026-03-11", 70], ["2026-03-12", 81], ["2026-03-13", 74], ["2026-03-14", 79]
  ] as Array<[string, number]>).map(([date, cost]) => ({ date, cost })),
  runnerShare: [
    { name: "Ubuntu", value: 56 },
    { name: "macOS", value: 31 },
    { name: "Windows", value: 13 }
  ],
  topSpenders: [
    { repo: "platform-web", workflow: "CI / test-and-build", runs: 182, minutes: 6220, cost: 402.91, trend: "up" as const },
    { repo: "ios-client", workflow: "Xcode / release-checks", runs: 47, minutes: 1888, cost: 384.4, trend: "up" as const },
    { repo: "api", workflow: "CI / integration", runs: 109, minutes: 3902, cost: 204.12, trend: "down" as const }
  ],
  repos: [
    { name: "platform-web", workflowCount: 12, monthlyCost: 512.88, expensiveWorkflow: "CI / test-and-build", spark: [10, 14, 12, 18, 15, 19, 22] },
    { name: "ios-client", workflowCount: 8, monthlyCost: 441.02, expensiveWorkflow: "Xcode / release-checks", spark: [18, 14, 21, 23, 19, 26, 28] },
    { name: "api", workflowCount: 10, monthlyCost: 296.44, expensiveWorkflow: "CI / integration", spark: [8, 9, 12, 11, 13, 12, 15] }
  ],
  workflowRuns: [
    { runNumber: 812, branch: "main", trigger: "push", duration: 22, cost: 4.12, status: "success", date: "2026-03-14T10:30:00.000Z", rerun: false },
    { runNumber: 811, branch: "feature/cache-tune", trigger: "pull_request", duration: 31, cost: 6.78, status: "failure", date: "2026-03-14T08:40:00.000Z", rerun: true },
    { runNumber: 810, branch: "main", trigger: "push", duration: 21, cost: 3.91, status: "success", date: "2026-03-13T22:15:00.000Z", rerun: false }
  ],
  jobs: [
    { run: "#812", checkout: 2, install: 8, test: 9, build: 3 },
    { run: "#811", checkout: 2, install: 10, test: 15, build: 4 },
    { run: "#810", checkout: 2, install: 7, test: 9, build: 3 }
  ],
  recommendations: [
    {
      id: "rec-1",
      repo_name: "ios-client",
      workflow_name: "Xcode / release-checks",
      recommendation_type: "EXPENSIVE_RUNNER",
      severity: "CRITICAL",
      title: "Move linting off macOS",
      description: "The workflow spends most of its billable time in shell and dependency setup steps that do not require Apple runners. Split the build matrix so only signing and simulator jobs stay on macOS.",
      estimated_monthly_savings_usd: 142,
      yaml_patch: "before:\n  runs-on: macos-latest\nafter:\n  jobs:\n    lint:\n      runs-on: ubuntu-latest\n    build-ios:\n      runs-on: macos-latest"
    },
    {
      id: "rec-2",
      repo_name: "platform-web",
      workflow_name: "CI / test-and-build",
      recommendation_type: "NO_CACHE",
      severity: "WARNING",
      title: "Add package caching",
      description: "The workflow installs dependencies from scratch on nearly every run. Adding `actions/setup-node` caching trims repeated install time and reduces rerun pressure.",
      estimated_monthly_savings_usd: 64,
      yaml_patch: "before:\n  - uses: actions/setup-node@v4\nafter:\n  - uses: actions/setup-node@v4\n    with:\n      node-version: 22\n      cache: npm"
    }
  ]
};

export async function getDashboardData() {
  const cookieStore = cookies();
  const installationId = cookieStore.get("rb-installation-id")?.value;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !installationId) {
    return mockOverview;
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: installation } = await supabase.from("installations").select("*").eq("id", installationId).single();
    return {
      ...mockOverview,
      installation: installation || mockOverview.installation
    };
  } catch {
    return mockOverview;
  }
}
