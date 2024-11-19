"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "January", responses: 120 },
  { month: "February", responses: 85 },
  { month: "March", responses: 95 },
  { month: "April", responses: 150 },
  { month: "May", responses: 200 },
  { month: "June", responses: 170 },
  { month: "July", responses: 220 },
  { month: "August", responses: 190 },
  { month: "September", responses: 250 },
  { month: "October", responses: 300 },
  { month: "November", responses: 180 },
  { month: "December", responses: 220 }
]

const chartConfig = {
  responses: {
    label: "Survey Responses",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig

export const SurveyResponsesChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Monthly Survey Responses</CardTitle>
        <CardDescription>Responses collected per month in 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="responses" fill="var(--chart-1)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
