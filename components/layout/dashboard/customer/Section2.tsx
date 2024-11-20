import * as React from "react"
import { SalesByChannelChart } from "@/components/features/dashboard/customer/SalesByChannelChart"
import { Overview } from "@/components/features/dashboard/customer/Overview"

export const Section2 = () => {
  return (
    <div className="grid gap-2">
      <SalesByChannelChart />
      <Overview/>
    </div>
  )
}
