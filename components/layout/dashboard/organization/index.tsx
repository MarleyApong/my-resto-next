import { Building, CheckCircle2, DollarSign, XCircle } from "lucide-react"
import { Section1 } from "../Section1"
import { Section2 } from "./Section2"

export const OrganizationStatistics = () => {
  const cardsData = [
    {
      icon: <Building className="w-full h-full" />,
      count: 5,
      name: "Organization(s)",
      iconColor: "text-blue-500",
      link: "/organizations"
    },
    {
      icon: <DollarSign className="w-full h-full" />,
      count: "1.2M",
      name: "Total Revenue",
      iconColor: "text-yellow-500"
    },
    {
      icon: <CheckCircle2 className="w-full h-full" />,
      count: 3,
      name: "Active Organizations",
      iconColor: "text-green-500"
    },
    {
      icon: <XCircle className="w-full h-full" />,
      count: 2,
      name: "Inactive Organizations",
      iconColor: "text-red-500"
    }
  ]

  return (
    <>
      <Section1 cardsData={cardsData} />
      <Section2/>
    </>
  )
}
