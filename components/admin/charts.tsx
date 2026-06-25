"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { day: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A961" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#C9A961" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#C9A961"
          strokeWidth={2}
          fill="url(#rev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProductsChart({
  data,
}: {
  data: { name: string; sold: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="sold" radius={[6, 6, 0, 0]} fill="hsl(var(--foreground))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
