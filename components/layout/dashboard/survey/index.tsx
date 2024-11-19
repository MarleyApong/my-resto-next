import { CheckCircle2, XCircle, TrendingUp, CalendarRange, Calendar, ClipboardList, ChartSpline, ClipboardPenLine } from "lucide-react"
import { Section1 } from "../Section1"
import { Section2 } from "./Section2"

export const SurveyStatistics = () => {
  const cardsData = [
    {
      icon: <ClipboardList className="w-full h-full" />,
      count: 500,
      name: "Survey(s)",
      iconColor: "text-blue-500",
      link: "/Survey"
    },
    {
      icon: <CheckCircle2 className="w-full h-full" />,
      count: 320,
      name: "Active Surveys",
      iconColor: "text-green-500"
    },
    {
      icon: <XCircle className="w-full h-full" />,
      count: 50,
      name: "Inactive Surveys",
      iconColor: "text-red-500"
    },
    {
      icon: <ClipboardPenLine className="w-full h-full" />,
      count: 35,
      name: "New Surveys (This Month)",
      iconColor: "text-purple-500"
    },
    {
      icon: <CalendarRange className="w-full h-full" />,
      count: 8,
      name: "New Surveys (This Week)",
      iconColor: "text-purple-500"
    },
    {
      icon: <Calendar className="w-full h-full" />,
      count: 3,
      name: "New Surveys (This Day)",
      iconColor: "text-purple-500"
    },
    {
      icon: <TrendingUp className="w-full h-full" />,
      count: 150,
      name: "High Engagement Surveys",
      iconColor: "text-orange-600"
    },
    {
      icon: <ChartSpline className="w-full h-full" />,
      count: "72%",
      name: "Global Response Rate",
      iconColor: "text-orange-500"
    },
  ]
  

  return (
    <>
      <Section1 cardsData={cardsData} />
      <Section2 />
    </>
  )
}
