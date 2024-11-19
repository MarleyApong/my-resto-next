import { Utensils, CheckCircle2, XCircle, DollarSign, TrendingUp, MapPin, CalendarRange, Calendar } from "lucide-react"
import { Section1 } from "../Section1"
import { Section2 } from "./Section2"

export const RestaurantStatistics = () => {
  const cardsData = [
    {
      icon: <Utensils className="w-full h-full" />,
      count: 500,
      name: "Restaurant(s)",
      iconColor: "text-blue-500",
      link: "/restaurant"
    },
    {
      icon: <CheckCircle2 className="w-full h-full" />,
      count: 320,
      name: "Active Restaurants",
      iconColor: "text-green-500"
    },
    {
      icon: <XCircle className="w-full h-full" />,
      count: 50,
      name: "Inactive Restaurants",
      iconColor: "text-red-500"
    },
    {
      icon: <DollarSign className="w-full h-full" />,
      count: "1.2M",
      name: "Total Revenue",
      iconColor: "text-yellow-500"
    },
    {
      icon: <TrendingUp className="w-full h-full" />,
      count: 35,
      name: "New Restaurants (This Month)",
      iconColor: "text-purple-500"
    },
    {
      icon: <CalendarRange className="w-full h-full" />,
      count: 8,
      name: "New Restaurants (This Week)",
      iconColor: "text-purple-500"
    },
    {
      icon: <Calendar className="w-full h-full" />,
      count: 3,
      name: "New Restaurants (This Day)",
      iconColor: "text-purple-500"
    },
    {
      icon: <MapPin className="w-full h-full" />,
      count: 45,
      name: "Cities Covered",
      iconColor: "text-blue-600"
    }
  ]
  

  return (
    <>
      <Section1 cardsData={cardsData} />
      <Section2 />
    </>
  )
}
