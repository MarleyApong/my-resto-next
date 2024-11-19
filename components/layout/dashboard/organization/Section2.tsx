import * as React from "react"
import { OverviewOfOrganizations } from "@/components/features/dashboard/organization/Overview"
import { SalesAnalytics } from "@/components/features/dashboard/organization/SalesAnalyticsChart"
import { TopOrganizations } from "@/components/features/dashboard/organization/TopOrganizationsChart"

export const Section2 = () => {
  return (
    <div className="grid gap-2">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <SalesAnalytics />
        <TopOrganizations/>
      </div>
      <OverviewOfOrganizations/>
    </div>
  )
}