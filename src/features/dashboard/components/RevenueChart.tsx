"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// This config maps your CSS variables to the chart
const chartConfig = {
  inr: { label: "INR Sales", color: "var(--chart-1)" },
  usd: { label: "USD Sales", color: "var(--chart-2)" },
}

export function RevenueTrend({ data }: { data: any }) {
  // Formatting data for Recharts based on your SalesAnalyticsView output
  const chartData = data.dates.map((date: string, i: number) => ({
    date,
    inr: data.inr_values[i],
    usd: data.usd_values[i],
  }))

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Sales Trends</CardTitle>
        <CardDescription>Daily successful payments across currencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorInr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="inr" 
                stroke="var(--chart-1)" 
                fillOpacity={1} 
                fill="url(#colorInr)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}