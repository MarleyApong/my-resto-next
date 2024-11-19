import { CheckCircle2, XCircle, TrendingUp, CalendarRange, Calendar, ChartSpline, ClipboardPenLine, LampFloor } from "lucide-react"
import { Section1 } from "../Section1"
import { Section2 } from "./Section2"

export const TableStatistics = () => {
  const cardsData = [
    {
      icon: <LampFloor className="w-full h-full" />,
      count: 50,
      name: "Total Tables",
      iconColor: "text-gray-500",
      link: "/Tables"
    },
    {
      icon: <TrendingUp className="w-full h-full" />,
      count: 30,
      name: "Tables Réservées Aujourd'hui",
      iconColor: "text-green-500"
    },
    {
      icon: <CalendarRange className="w-full h-full" />,
      count: 15,
      name: "Réservations à Venir (Semaine)",
      iconColor: "text-purple-500"
    },
    {
      icon: <ChartSpline className="w-full h-full" />,
      count: "75%",
      name: "Taux d'Occupation",
      iconColor: "text-orange-500"
    },
    {
      icon: <CheckCircle2 className="w-full h-full" />,
      count: 35,
      name: "Tables Disponibles",
      iconColor: "text-green-500"
    },
    {
      icon: <XCircle className="w-full h-full" />,
      count: 15,
      name: "Tables Occupées",
      iconColor: "text-red-500"
    },
    {
      icon: <ClipboardPenLine className="w-full h-full" />,
      count: 8,
      name: "Nouvelles Réservations (Ce Mois-ci)",
      iconColor: "text-purple-500"
    },
    {
      icon: <Calendar className="w-full h-full" />,
      count: 2,
      name: "Réservations de Dernière Minute (Aujourd'hui)",
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
