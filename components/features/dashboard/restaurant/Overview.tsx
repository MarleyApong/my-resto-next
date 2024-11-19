import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const restaurants = [
  {
    restaurants: "Restaurant A",
    status: "Active",
    totalEarnings: "$5,000.00",
    creationDate: "2020-05-12"
  },
  {
    restaurants: "Restaurant B",
    status: "Inactive",
    totalEarnings: "$5,500.00",
    creationDate: "2021-08-25"
  },
  {
    restaurants: "Restaurant C",
    status: "Active",
    totalEarnings: "$5,000.00",
    creationDate: "2019-03-18"
  },
  {
    restaurants: "Restaurant D",
    status: "Active",
    totalEarnings: "$8,000.00",
    creationDate: "2022-01-10"
  },
  {
    restaurants: "Restaurant E",
    status: "Inactive",
    totalEarnings: "$1,000.00",
    creationDate: "2021-11-22"
  }
]

export const OverviewOfRestaurants = () => {
  return (
    <Table className="bg-background shadow-md">
      <TableCaption className="text-primary font-medium mt-0 caption-top">Overview of restaurants and their performance.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Restaurants</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total Earnings</TableHead>
          <TableHead>Creation Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {restaurants.map((resto, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{resto.restaurants}</TableCell>
            <TableCell className="font-medium">
              <Badge className={`${resto.status === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"} rounded`}>{resto.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{resto.totalEarnings}</TableCell>
            <TableCell className="font-medium">{new Date(resto.creationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
