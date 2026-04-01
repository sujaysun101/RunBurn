import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";

export function MetricCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  const positive = !hint.toLowerCase().includes("down");
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="bg-card/75">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{currency(value)}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
        <TrendIcon className="size-4" />
        <span>{hint}</span>
      </CardContent>
    </Card>
  );
}
