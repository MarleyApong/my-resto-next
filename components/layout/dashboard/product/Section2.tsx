import * as React from "react"
import { ProductSalesChart } from "@/components/features/dashboard/product/ProductSalesChart"
import { CategorySalesChart } from "@/components/features/dashboard/product/CategorySalesChart"
import { TopDishesChart } from "@/components/features/dashboard/product/TopDishesChart"
import { AverageRatingsChart } from "@/components/features/dashboard/product/AverageRatingsChart"
import { TableStatisticsChart } from "@/components/features/dashboard/Table/TableStatisticsChart"

export const Section2 = () => {
  return (
    <div className="grid gap-2">
      <TableStatisticsChart />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <CategorySalesChart />
        <ProductSalesChart />
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <TopDishesChart />
        <AverageRatingsChart />
      </div>
    </div>
  )
}
