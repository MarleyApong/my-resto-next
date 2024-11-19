"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", orders: 16,},
  { month: "February", orders: 5},
  { month: "March", orders: 7},
  { month: "April", orders: 7},
  { month: "May", orders: 29},
  { month: "June", orders: 14},
  { month: "July", orders: 80},
  { month: "August", orders: 50},
  { month: "September", orders: 100},
  { month: "October", orders: 75},
  { month: "November", orders: 20},
  { month: "December", orders: 90}
]

const chartConfig = {
  orders: {
    label: "Orders - Organization",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig

export const TopRestaurants = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Monthly Orders by restaurant</CardTitle>
        <CardDescription>Orders per month for 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="orders" fill="var(--chart-3)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
