"use client"

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import home from "@/public/assets/img/home/home.jpg"
import Image from "next/image"

interface RestaurantData {
  picture?: string
  description?: string
}

const Webpage: React.FC = () => {
  const pathname = usePathname()
  const pathParts = pathname.split("/").filter(Boolean)
  const organization = pathParts[0]
  const restaurant = pathParts[1]

  const [data, setData] = useState<RestaurantData>({})

  const handleNavToOrder = () => {
    window.location.href = `/${organization}/${restaurant}/order`
  }

  const handleNavToNote = () => {
    window.location.href = `/${organization}/${restaurant}/note`
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Remplacez par un appel à une API réelle
        const fetchedData = {
          picture: "/assets/img/home/home.jpg",
          description: `Bienvenue chez ${restaurant} de ${organization}! Découvrez nos plats délicieux et savoureux !`
        }
        setData(fetchedData)
      } catch (err) {
        console.error("Échec du chargement des données du restaurant", err)
      }
    }

    if (organization && restaurant) loadData()
  }, [organization, restaurant])

  return (
    <div className="flex h-screen relative overflow-hidden">
      <div className="relative w-full h-full">
        <Image src={data.picture || home} alt="Restaurant" layout="fill" objectFit="cover" className="absolute top-0 left-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50" />
      </div>

      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-10 p-8">
        <h1 className="text-4xl font-bold">Bienvenue sur notre page !</h1>
        <p className="mt-4 text-lg">{data.description}</p>
        <div className="mt-8 space-x-4">
          <Button variant="printemps" className="hover:bg-white hover:text-black" onClick={handleNavToOrder}>
            Commander
          </Button>
          <Button variant="secondary" className="bg-blue-600 hover:bg-white hover:text-blue-600" onClick={handleNavToNote}>
            Notez-nous
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Webpage
