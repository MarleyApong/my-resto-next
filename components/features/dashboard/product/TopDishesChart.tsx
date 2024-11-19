"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Données des ventes des plats les plus populaires
const topDishes = [
  { dish: "Pizza Margherita", orders: 300 },
  { dish: "Burger Classic", orders: 250 },
  { dish: "Tiramisu", orders: 180 },
  { dish: "Salade César", orders: 150 },
  { dish: "Limonade Maison", orders: 200 }
]

export const TopDishesChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Top 5 Plats Populaires</CardTitle>
        <CardDescription>Nombre de commandes par plat</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topDishes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dish" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="var(--chart-4)" radius={3} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
