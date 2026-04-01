import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobsChart } from "@/components/JobsChart";
import { RecommendationCard } from "@/components/RecommendationCard";
import { currency } from "@/lib/utils";
import { getDashboardData } from "@/lib/data";

function statusVariant(status: string) {
  if (status === "success") return "success";
  if (status === "failure") return "danger";
  return "warning";
}

export default async function WorkflowDetailPage({ params }: { params: { owner: string; repo: string; workflow_id: string } }) {
  const data = await getDashboardData();
  const workflowName = decodeURIComponent(params.workflow_id);
  const workflowRows = data.workflowRuns;
  const recommendations = data.recommendations.filter((item) => item.workflow_name === workflowName || item.repo_name === params.repo);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardDescription>{params.owner}/{params.repo}</CardDescription>
            <CardTitle className="text-3xl">{workflowName}</CardTitle>
          </div>
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Last run status</p>
              <Badge variant={statusVariant(workflowRows[0]?.status || "warning")} className="mt-2">{workflowRows[0]?.status || "unknown"}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly cost</p>
              <p className="mt-2 text-xl font-semibold">{currency(workflowRows.reduce((sum, row) => sum + row.cost, 0))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Run count</p>
              <p className="mt-2 text-xl font-semibold">{workflowRows.length}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <THead>
                  <TR>
                    <TH>Run #</TH>
                    <TH>Branch</TH>
                    <TH>Trigger</TH>
                    <TH>Duration</TH>
                    <TH>Cost</TH>
                    <TH>Status</TH>
                    <TH>Date</TH>
                  </TR>
                </THead>
                <TBody>
                  {workflowRows.map((row) => (
                    <TR key={row.runNumber}>
                      <TD className="font-medium">
                        #{row.runNumber}
                        {row.rerun ? <span className="ml-2 rounded-full bg-warning/15 px-2 py-1 text-xs text-warning">Re-run</span> : null}
                      </TD>
                      <TD>{row.branch}</TD>
                      <TD>{row.trigger}</TD>
                      <TD>{row.duration} min</TD>
                      <TD>{currency(row.cost)}</TD>
                      <TD><Badge variant={statusVariant(row.status)}>{row.status}</Badge></TD>
                      <TD>{new Date(row.date).toLocaleDateString()}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <JobsChart data={data.jobs} />
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
