"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ratingsDistribution = [
  { ratingRange: "1-2", count: 20 },
  { ratingRange: "2-3", count: 50 },
  { ratingRange: "3-4", count: 100 },
  { ratingRange: "4-5", count: 200 }
]

export const RatingDistributionChart = () => {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle>Rating Distribution</CardTitle>
        <CardDescription>Number of responses in each rating range</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ratingsDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ratingRange" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="var(--chart-3)" radius={3} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
