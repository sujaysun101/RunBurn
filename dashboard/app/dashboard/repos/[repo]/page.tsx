import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowTable } from "@/components/WorkflowTable";
import { getDashboardData } from "@/lib/data";

export default async function RepoDetailPage({ params }: { params: { repo: string } }) {
  const data = await getDashboardData();
  const repo = data.repos.find((item) => item.name === decodeURIComponent(params.repo));

  if (!repo) {
    notFound();
  }

  const workflows = data.topSpenders.filter((row) => row.repo === repo.name);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardDescription>Repository view</CardDescription>
          <CardTitle>{repo.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workflow count</p>
            <p className="mt-2 text-3xl font-semibold">{repo.workflowCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monthly cost</p>
            <p className="mt-2 text-3xl font-semibold">${repo.monthlyCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top workflow</p>
            <p className="mt-2 text-lg font-semibold">{repo.expensiveWorkflow}</p>
          </div>
        </CardContent>
      </Card>
      <WorkflowTable rows={workflows} />
    </div>
  );
}
