"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const restaurantData = [
  {
    name: "Restaurant A",
    orders: 450,
    tables: 20,
    averageRating: 4.8,
    registeredClients: 300
  },
  {
    name: "Restaurant B",
    orders: 380,
    tables: 15,
    averageRating: 4.6,
    registeredClients: 250
  },
  {
    name: "Restaurant C",
    orders: 520,
    tables: 25,
    averageRating: 4.9,
    registeredClients: 400
  },
  {
    name: "Restaurant D",
    orders: 140,
    tables: 10,
    averageRating: 3.8,
    registeredClients: 120
  },
]

const chartConfig = {
  orders: {
    label: "Orders",
    color: "var(--chart-1)"
  },
  tables: {
    label: "Tables",
    color: "var(--chart-2)"
  },
  averageRating: {
    label: "Rating",
    color: "var(--chart-3)"
  },
  registeredClients: {
    label: "Registered Clients",
    color: "var(--chart-4)"
  }
} satisfies ChartConfig

export const Performance = () => {
  return (
    <Card className="rounded-sm shadow-md">
      <CardHeader>
        <CardTitle>Top 10 Restaurants Performance</CardTitle>
        <CardDescription>Key performance metrics of the top 10 restaurants.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart width={800} height={400} data={restaurantData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number"/>
            <YAxis dataKey="name" type="category" width={60} tickLine={false} />
            <Bar dataKey="orders" fill="var(--chart-2)" name="Orders" stackId="a" />
            <Bar dataKey="tables" fill="var(--chart-3)" name="Tables" stackId="a" />
            <Bar dataKey="averageRating" fill="var(--chart-1)" name="Avg. Rating" stackId="a" />
            <Bar dataKey="registeredClients" fill="var(--chart-5)" name="Clients" stackId="a" />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `Restaurant: ${value}`} />} cursor={false} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
