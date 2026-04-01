import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { currency } from "@/lib/utils";

export function WorkflowTable({
  rows
}: {
  rows: { repo: string; workflow: string; runs: number; minutes: number; cost: number; trend: "up" | "down" }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Highest cost workflows this month</CardDescription>
        <CardTitle>Top spenders</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Repo</TH>
              <TH>Workflow</TH>
              <TH>Runs</TH>
              <TH>Total Minutes</TH>
              <TH>Estimated Cost</TH>
              <TH>Trend</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={`${row.repo}-${row.workflow}`}>
                <TD className="font-medium">{row.repo}</TD>
                <TD>
                  <Link href={`/dashboard/workflows/runburn-demo/${row.repo}/${encodeURIComponent(row.workflow)}`} className="hover:text-primary">
                    {row.workflow}
                  </Link>
                </TD>
                <TD>{row.runs}</TD>
                <TD>{Math.round(row.minutes)}</TD>
                <TD>{currency(row.cost)}</TD>
                <TD>
                  <Badge variant={row.trend === "up" ? "warning" : "success"} className="gap-1">
                    {row.trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {row.trend}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  );
}
