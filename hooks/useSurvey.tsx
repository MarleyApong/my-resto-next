import { SurveyContext } from "@/contexts/SurveyContext"
import { useContext } from "react"

export const useSurvey = () => {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyProvider")
  }
  return context
}