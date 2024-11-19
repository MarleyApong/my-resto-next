import * as React from "react"
import { OverviewOfSurveys } from "@/components/features/dashboard/survey/Overview"
import { SurveyResponsesChart } from "@/components/features/dashboard/survey/SurveyResponsesChart"
import { RatingDistributionChart } from "@/components/features/dashboard/survey/RatingDistributionChart"

export const Section2 = () => {
  return (
    <div className="grid gap-2">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <RatingDistributionChart />
        <SurveyResponsesChart />
      </div>
      <OverviewOfSurveys />
    </div>
  )
}
