"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Données des notes moyennes
const averageRatings = [
  { category: "Entrées", averageRating: 4.2 },
  { category: "Plats Principaux", averageRating: 4.5 },
  { category: "Desserts", averageRating: 4.0 },
  { category: "Boissons", averageRating: 4.3 }
]

export const AverageRatingsChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Notes Moyennes par Catégorie</CardTitle>
        <CardDescription>Notes moyennes des clients (sur 5)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={averageRatings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis domain={[0, 5]} tickFormatter={(value) => `${value}/5`} />
            <Tooltip />
            <Bar dataKey="averageRating" fill="var(--chart-5)" radius={3} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
