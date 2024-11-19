"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Données des ventes mensuelles
const chartData = [
  { month: "January", sales: 400 },
  { month: "February", sales: 350 },
  { month: "March", sales: 500 },
  { month: "April", sales: 450 },
  { month: "May", sales: 600 },
  { month: "June", sales: 580 },
  { month: "July", sales: 700 },
  { month: "August", sales: 650 },
  { month: "September", sales: 720 },
  { month: "October", sales: 750 },
  { month: "November", sales: 680 },
  { month: "December", sales: 800 }
]

// Configuration du chart
const chartConfig = {
  sales: {
    label: "Ventes de Plats",
    color: "var(--chart-5)"
  }
} satisfies ChartConfig

export const ProductSalesChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Ventes Mensuelles des Plats</CardTitle>
        <CardDescription>Nombre de plats vendus par mois en 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="sales" fill="var(--chart-5)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
