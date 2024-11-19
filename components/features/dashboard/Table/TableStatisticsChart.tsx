import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Données modifiées pour les tables
const tableData = [
  { date: "2024-04-01", reserved: 20, available: 30 },
  { date: "2024-04-02", reserved: 15, available: 35 },
  { date: "2024-04-03", reserved: 25, available: 25 },
  { date: "2024-04-04", reserved: 28, available: 22 },
  { date: "2024-04-05", reserved: 35, available: 15 },
  { date: "2024-04-06", reserved: 40, available: 10 },
  { date: "2024-04-07", reserved: 18, available: 32 },
  { date: "2024-04-08", reserved: 22, available: 28 },
  { date: "2024-04-09", reserved: 30, available: 20 },
  { date: "2024-04-10", reserved: 35, available: 15 },
]

const tableChartConfig = {
  reserved: {
    label: "Tables Réservées",
    color: "var(--chart-1)",
  },
  available: {
    label: "Tables Disponibles",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function TableStatisticsChart() {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Filtrage des données en fonction de la période sélectionnée
  const filteredData = tableData.filter((item) => {
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
    <Card className="rounded-sm shadow-sm">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Statistiques des Tables</CardTitle>
          <CardDescription>
            Tendances des réservations et disponibilités des tables
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Sélectionner une période"
          >
            <SelectValue placeholder="Derniers 3 mois" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Derniers 3 mois
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Derniers 30 jours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Derniers 7 jours
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={tableChartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillReserved" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAvailable" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
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
                return date.toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="reserved"
              type="natural"
              fill="url(#fillReserved)"
              stroke="var(--chart-1)"
              stackId="a"
            />
            <Area
              dataKey="available"
              type="natural"
              fill="url(#fillAvailable)"
              stroke="var(--chart-2)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
