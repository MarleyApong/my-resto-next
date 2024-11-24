import * as React from "react"
import { TableStatisticsChart } from "@/components/features/dashboard/table/TableStatisticsChart"
import { TableOrdersChart } from "@/components/features/dashboard/table/TableOrdersChart"
import Overview from "@/components/features/dashboard/table/Overview"

export const Section2 = () => {
  return (
    <div className="grid gap-2">
      <TableStatisticsChart />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <TableOrdersChart />
      </div>
      <Overview/>
    </div>
  )
}
