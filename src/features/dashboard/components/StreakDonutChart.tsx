"use client"

import { Pie, PieChart, Label } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function StreakDonutChart({ data }: { data: any }) {
  // Mapping your Django response to Recharts format
  const chartData = [
    { category: "Ghosts", count: data.counts[0], fill: "var(--chart-1)" },
    { category: "Casuals", count: data.counts[1], fill: "var(--chart-2)" },
    { category: "Committed", count: data.counts[2], fill: "var(--chart-3)" },
    { category: "Addicted", count: data.counts[3], fill: "var(--chart-4)" },
  ]

  const chartConfig = {
    count: { label: "Users" },
    Ghosts: { label: "Ghosts", color: "oklch(0.704 0.04 256.788)" },
    Casuals: { label: "Casuals", color: "oklch(0.6 0.118 184.704)" },
    Committed: { label: "Committed", color: "oklch(0.398 0.07 227.392)" },
    Addicted: { label: "Addicted", color: "oklch(0.646 0.222 41.116)" },
  } satisfies ChartConfig

  const totalUsers = data.counts.reduce((a: number, b: number) => a + b, 0)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>User Composition</CardTitle>
        <CardDescription>Based on Current Streaks</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalUsers}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Users
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}