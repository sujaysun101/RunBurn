"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";

function severityVariant(severity: string) {
  if (severity === "CRITICAL") return "danger";
  if (severity === "WARNING") return "warning";
  return "success";
}

export function RecommendationCard({
  recommendation
}: {
  recommendation: {
    title: string;
    description: string;
    severity: string;
    repo_name: string;
    workflow_name: string;
    estimated_monthly_savings_usd: number;
    yaml_patch: string;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={severityVariant(recommendation.severity)}>{recommendation.severity}</Badge>
            <Badge>{recommendation.repo_name}</Badge>
          </div>
          <div>
            <CardTitle>{recommendation.title}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl">{recommendation.description}</CardDescription>
          </div>
        </div>
        <Badge variant="success">Est. savings: {currency(recommendation.estimated_monthly_savings_usd)}/month</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] bg-muted/55 p-4 text-sm text-muted-foreground">
          <span>{recommendation.workflow_name}</span>
          <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            YAML patch
          </Button>
        </div>
        {open ? (
          <pre className="overflow-x-auto rounded-[1.1rem] bg-background p-4 text-xs leading-6 text-muted-foreground">
            <code>{recommendation.yaml_patch}</code>
          </pre>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Dismiss</Button>
          <Button>Mark as Fixed</Button>
        </div>
      </CardContent>
    </Card>
  );
}
