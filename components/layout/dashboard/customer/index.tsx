import { Users, Star, UserCheck, History, TrendingUp, UserPlus, Clock, Repeat, ThumbsUp, UserMinus, Medal, Wallet } from "lucide-react"
import { Section1 } from "../Section1"
import { Section2 } from "./Section2"

export const CustomerStatistics = () => {
  const cardsData = [
    {
      icon: <Users className="w-full h-full" />,
      count: 2500,
      name: "Clients Totaux",
      iconColor: "text-blue-500",
      link: "/customers"
    },
    {
      icon: <Star className="w-full h-full" />,
      count: 450,
      name: "Clients VIP",
      iconColor: "text-yellow-500"
    },
    {
      icon: <UserCheck className="w-full h-full" />,
      count: 180,
      name: "Clients Actifs (Ce Mois)",
      iconColor: "text-green-500"
    },
    {
      icon: <History className="w-full h-full" />,
      count: 850,
      name: "Visites ce Mois",
      iconColor: "text-purple-500"
    },
    {
      icon: <TrendingUp className="w-full h-full" />,
      count: "45%",
      name: "Taux de Retour",
      iconColor: "text-orange-500"
    },
    {
      icon: <UserPlus className="w-full h-full" />,
      count: 75,
      name: "Nouveaux Clients (Ce Mois)",
      iconColor: "text-green-500"
    },
    {
      icon: <Clock className="w-full h-full" />,
      count: "28min",
      name: "Temps Moyen par Visite",
      iconColor: "text-gray-500"
    },
    {
      icon: <Repeat className="w-full h-full" />,
      count: "3.2",
      name: "Fréquence de Visite/Mois",
      iconColor: "text-blue-500"
    },
    {
      icon: <Wallet className="w-full h-full" />,
      count: "42€",
      name: "Panier Moyen",
      iconColor: "text-emerald-500"
    },
    {
      icon: <ThumbsUp className="w-full h-full" />,
      count: "4.8",
      name: "Note Moyenne Satisfaction",
      iconColor: "text-yellow-600"
    },
    {
      icon: <UserMinus className="w-full h-full" />,
      count: "5%",
      name: "Taux d'Attrition Mensuel",
      iconColor: "text-red-500"
    },
    {
      icon: <Medal className="w-full h-full" />,
      count: 120,
      name: "Programme de Fidélité",
      iconColor: "text-amber-500"
    }
  ]

  return (
    <>
      <Section1 cardsData={cardsData} />
      <Section2 />
    </>
  )
}
