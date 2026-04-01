import { MetricCard } from "@/components/MetricCard";
import { RunnerShareChart } from "@/components/RunnerShareChart";
import { SpendChart } from "@/components/SpendChart";
import { WorkflowTable } from "@/components/WorkflowTable";
import { getDashboardData } from "@/lib/data";

export default async function OverviewPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SpendChart data={data.dailySpend} />
        <RunnerShareChart data={data.runnerShare} />
      </section>
      <WorkflowTable rows={data.topSpenders} />
    </div>
  );
}
