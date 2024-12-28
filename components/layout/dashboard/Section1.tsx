import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface CardData {
  icon: React.ReactNode
  count: number | string
  name: string
  iconColor?: string
  link?: string | null
}

interface SectionProps {
  cardsData: CardData[]
}

export const Section1: React.FC<SectionProps> = ({ cardsData }) => {
  return (
    <div className="grid grid-cols-1 gap-2 mb-2 sm:grid-cols-2 lg:grid-cols-4">
      {cardsData.map((card, index) => (
        <Card key={index} className="shadow-md rounded-sm hover:shadow-lg transition-shadow h-[100px] flex justify-between items-center p-4">
          <div className="flex flex-col justify-center">
            <CardTitle className="text-sm font-semibold">{card.name}</CardTitle>
            <p className="text-2xl font-bold">{card.count}</p>
          </div>
          <div>
            <div className={`flex items-center justify-center ml-auto`}>
              <span className="cursor-pointer">
                {React.cloneElement(card.icon as React.ReactElement, {
                  className: `w-12 h-12 ${card.iconColor}`
                })}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
