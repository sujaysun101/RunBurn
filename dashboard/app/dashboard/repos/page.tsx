import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { RepoSparkline } from "@/components/RepoSparkline";
import { currency } from "@/lib/utils";
import { getDashboardData } from "@/lib/data";

export default async function RepositoriesPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Search and compare cost pressure across tracked repositories.</p>
      <div className="grid gap-4">
        {data.repos.map((repo) => (
          <Link key={repo.name} href={`/dashboard/repos/${encodeURIComponent(repo.name)}`}>
            <Card className="transition hover:-translate-y-0.5 hover:border-primary/40">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle>{repo.name}</CardTitle>
                  <CardDescription>{repo.workflowCount} workflows · Most expensive: {repo.expensiveWorkflow}</CardDescription>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monthly cost</p>
                    <p className="mt-1 text-xl font-semibold">{currency(repo.monthlyCost)}</p>
                  </div>
                  <RepoSparkline values={repo.spark} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
