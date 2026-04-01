"use client";

import { Line } from "recharts/lib/cartesian/Line";
import { LineChart } from "recharts/lib/chart/LineChart";
import { ResponsiveContainer } from "recharts/lib/component/ResponsiveContainer";

export function RepoSparkline({ values }: { values: number[] }) {
  const data = values.map((value, index) => ({ index, value }));
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
