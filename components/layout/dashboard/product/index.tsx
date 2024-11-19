import { CheckCircle2, XCircle, TrendingUp, CalendarRange, Calendar, ChartSpline, ClipboardPenLine, Cookie } from "lucide-react"
import { Section1 } from "../Section1"
import { Section2 } from "./Section2"

export const ProductStatistics = () => {
  const cardsData = [
    {
      icon: <Cookie className="w-full h-full" />,
      count: 120,
      name: "Total Plats au Menu",
      iconColor: "text-orange-500",
      link: "/Menu"
    },
    {
      icon: <TrendingUp className="w-full h-full" />,
      count: 45,
      name: "Plats les Plus Vendus",
      iconColor: "text-green-500"
    },
    {
      icon: <CalendarRange className="w-full h-full" />,
      count: 10,
      name: "Plats du Jour",
      iconColor: "text-purple-500"
    },
    {
      icon: <ChartSpline className="w-full h-full" />,
      count: "85%",
      name: "Taux de Satisfaction des Clients",
      iconColor: "text-orange-500"
    },
    {
      icon: <CheckCircle2 className="w-full h-full" />,
      count: 95,
      name: "Plats Disponibles",
      iconColor: "text-green-500"
    },
    {
      icon: <XCircle className="w-full h-full" />,
      count: 25,
      name: "Plats Indisponibles",
      iconColor: "text-red-500"
    },
    {
      icon: <ClipboardPenLine className="w-full h-full" />,
      count: 5,
      name: "Nouveaux Plats (Ce Mois-ci)",
      iconColor: "text-purple-500"
    },
    {
      icon: <Calendar className="w-full h-full" />,
      count: 2,
      name: "Nouveaux Plats (Ce Jour)",
      iconColor: "text-purple-500"
    }
  ]

  return (
    <>
      <Section1 cardsData={cardsData} />
      <Section2 />
    </>
  )
}
