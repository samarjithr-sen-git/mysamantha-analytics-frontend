"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  inr: { label: "INR (₹)", color: "oklch(0.646 0.222 41.116)" }, // Chart-1
  usd: { label: "USD ($)", color: "oklch(0.6 0.118 184.704)" },  // Chart-2
} satisfies ChartConfig

export function RevenueTrendChart({ data }: { data: any }) {
  // We transform your backend's parallel arrays into a single array of objects for Recharts
  const chartData = data.dates.map((date: string, i: number) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inr: data.inr_values[i],
    usd: data.usd_values[i],
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue Streams</CardTitle>
        <CardDescription>Comparative growth: INR vs USD</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="inr"
                type="monotone"
                fill="var(--color-inr)"
                fillOpacity={0.1}
                stroke="var(--color-inr)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="usd"
                type="monotone"
                fill="var(--color-usd)"
                fillOpacity={0.1}
                stroke="var(--color-usd)"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}