"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const chartData = [
  { date: "2024-04-01", organizationA: 12000, organizationB: 15000 },
  { date: "2024-04-02", organizationA: 18000, organizationB: 20000 },
  { date: "2024-04-03", organizationA: 25000, organizationB: 22000 },
  { date: "2024-04-04", organizationA: 10000, organizationB: 2700 },
  { date: "2024-04-05", organizationA: 3500, organizationB: 32000 },
  { date: "2024-04-06", organizationA: 40000, organizationB: 38000 },
  { date: "2024-04-07", organizationA: 2000, organizationB: 38000 },
  { date: "2024-04-08", organizationA: 3000, organizationB: 38000 },
  { date: "2024-04-09", organizationA: 4000, organizationB: 38000 }
  // Ajoutez plus de données selon vos besoins
]

const chartConfig = {
  organizationA: {
    label: "Organization A",
    color: "var(--chart-1)"
  },
  organizationB: {
    label: "Organization B",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig

export const SalesAnalytics = () => {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="rounded-sm">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Revenue Analytics</CardTitle>
          <CardDescription>Showing total revenue for the selected period</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-sm sm:ml-auto" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOrganizationA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillOrganizationB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="organizationA" type="natural" fill="url(#fillOrganizationA)" stroke="var(--chart-1)" stackId="a" />
            <Area dataKey="organizationB" type="natural" fill="url(#fillOrganizationB)" stroke="var(--chart-2)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
