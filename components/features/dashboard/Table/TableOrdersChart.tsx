"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

// Données des ventes par catégorie
const chartData = [
  { table: "T-01", orders: 400 },
  { table: "T-02", orders: 350 },
  { table: "T-03", orders: 500 },
  { table: "T-04", orders: 450 },
  { table: "T-05", orders: 600 },
  { table: "T-06", orders: 580 },
  { table: "T-07", orders: 700 },
  { table: "T-08", orders: 650 },
  { table: "T-09", orders: 720 },
  { table: "T-10", orders: 750 },
]

const chartConfig = {
  orders: {
    label: "Commande: ",
    color: "var(--chart-5)"
  }
} satisfies ChartConfig

export const TableOrdersChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Top 10 des Tables les Plus Actives</CardTitle>
        <CardDescription>Classement par nombre de commandes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="table" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="var(--chart-3)" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
