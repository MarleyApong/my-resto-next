"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", orders: 186,},
  { month: "February", orders: 305},
  { month: "March", orders: 237},
  { month: "April", orders: 73},
  { month: "May", orders: 209},
  { month: "June", orders: 214},
  { month: "July", orders: 180},
  { month: "August", orders: 250},
  { month: "September", orders: 300},
  { month: "October", orders: 275},
  { month: "November", orders: 320},
  { month: "December", orders: 290}
]

const chartConfig = {
  orders: {
    label: "Orders - Organization",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig

export const TopOrganizations = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Monthly Orders by Organization</CardTitle>
        <CardDescription>Orders per month for 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="orders" fill="var(--chart-2)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
