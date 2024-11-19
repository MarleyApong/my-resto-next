import * as React from "react"
import { OverviewOfRestaurants } from "@/components/features/dashboard/restaurant/Overview"
import { Performance } from "@/components/features/dashboard/restaurant/PerformanceChart"
import { SalesAnalytics } from "@/components/features/dashboard/restaurant/SalesAnalyticsChart"
import { TopRestaurants } from "@/components/features/dashboard/restaurant/TopRestaurantsChart"

export const Section2 = () => {
  return (
    <div className="grid gap-2">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <SalesAnalytics />
        <TopRestaurants />
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <Performance />
      </div>
      <OverviewOfRestaurants />
    </div>
  )
}
