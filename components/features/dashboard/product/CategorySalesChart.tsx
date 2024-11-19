"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Données des ventes par catégorie
const categorySales = [
  { category: "Entrées", sales: 150 },
  { category: "Plats Principaux", sales: 400 },
  { category: "Desserts", sales: 120 },
  { category: "Boissons", sales: 300 }
]

export const CategorySalesChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Ventes par Catégorie</CardTitle>
        <CardDescription>Nombre total de ventes par type de plat</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categorySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="var(--chart-3)" radius={3} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
