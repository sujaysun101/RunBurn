"use client";

import { Bar } from "recharts/lib/cartesian/Bar";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { BarChart } from "recharts/lib/chart/BarChart";
import { Legend } from "recharts/lib/component/Legend";
import { ResponsiveContainer } from "recharts/lib/component/ResponsiveContainer";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function JobsChart({ data }: { data: { run: string; checkout: number; install: number; test: number; build: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Last 20 runs</CardDescription>
        <CardTitle>Job duration stack</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis dataKey="run" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="checkout" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="install" stackId="a" fill="#f97316" />
            <Bar dataKey="test" stackId="a" fill="#22c55e" />
            <Bar dataKey="build" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
