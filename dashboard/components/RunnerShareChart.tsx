"use client";

import { Pie } from "recharts/lib/polar/Pie";
import { PieChart } from "recharts/lib/chart/PieChart";
import { Cell } from "recharts/lib/component/Cell";
import { ResponsiveContainer } from "recharts/lib/component/ResponsiveContainer";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";

const COLORS = ["#ff7a45", "#38bdf8", "#22c55e", "#a855f7"];

export function RunnerShareChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Runner mix</CardDescription>
        <CardTitle>Cost by runner OS</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={74} outerRadius={102} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => currency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
