"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import home from "@/public/assets/img/home/home.jpg"
import Image from "next/image"
import { useI18n } from "@/locales/client"

interface RestaurantData {
  picture?: string
  description?: string
}

const Webpage: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const organization = pathname.split("/")[1]
  const restaurant = pathname.split("/")[2]
  const t = useI18n()

  const [data, setData] = useState<RestaurantData>({})

  const handleNavToOrder = () => {
    const query = searchParams.toString()
    window.location.href = `/${organization}/${restaurant}/order?${query}`
  }

  const handleNavToNote = () => {
    const query = searchParams.toString()
    window.location.href = `/${organization}/${restaurant}/note?${query}`
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedData = {
          picture: "https://via.placeholder.com/800x600",
          description: "Découvrez nos plats délicieux et savoureux !"
        }
        setData(fetchedData)
      } catch (err) {
        console.error("Échec du chargement des données du restaurant", err)
      }
    }

    if (restaurant) loadData()
  }, [restaurant])

  return (
    <div className="flex h-screen relative overflow-hidden">
      <div className="relative w-full h-full">
        <Image src={data.picture || home} alt="Restaurant" layout="fill" objectFit="cover" className="absolute top-0 left-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50" />
      </div>

      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-10 p-8">
        <h1 className="text-4xl font-bold">{t("hello")} sur notre page !</h1>
        <p className="mt-4 text-lg">{data.description}</p>
        <div className="mt-8 space-x-4">
          <Button variant="printemps" className="hover:bg-white hover:text-black" onClick={handleNavToOrder}>
            Commander
          </Button>
          <Button variant="secondary" onClick={handleNavToNote}>
            Notez-nous
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Webpage
