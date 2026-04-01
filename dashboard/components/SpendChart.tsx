"use client";

import { Area } from "recharts/lib/cartesian/Area";
import { CartesianGrid } from "recharts/lib/cartesian/CartesianGrid";
import { XAxis } from "recharts/lib/cartesian/XAxis";
import { YAxis } from "recharts/lib/cartesian/YAxis";
import { AreaChart } from "recharts/lib/chart/AreaChart";
import { ResponsiveContainer } from "recharts/lib/component/ResponsiveContainer";
import { Tooltip } from "recharts/lib/component/Tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";

export function SpendChart({ data }: { data: { date: string; cost: number }[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Last 30 days</CardDescription>
        <CardTitle>Daily spend</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value: string | number) => `$${value}`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => currency(Number(value))} />
            <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fill="url(#spend)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
