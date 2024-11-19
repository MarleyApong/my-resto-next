import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const organizations = [
  {
    organization: "Org A",
    restaurants: 10,
    status: "Active",
    totalEarnings: "$15,000.00",
    creationDate: "2020-05-12"
  },
  {
    organization: "Org B",
    restaurants: 5,
    status: "Inactive",
    totalEarnings: "$7,500.00",
    creationDate: "2021-08-25"
  },
  {
    organization: "Org C",
    restaurants: 20,
    status: "Active",
    totalEarnings: "$25,000.00",
    creationDate: "2019-03-18"
  },
  {
    organization: "Org D",
    restaurants: 15,
    status: "Active",
    totalEarnings: "$18,000.00",
    creationDate: "2022-01-10"
  },
  {
    organization: "Org E",
    restaurants: 8,
    status: "Inactive",
    totalEarnings: "$10,000.00",
    creationDate: "2021-11-22"
  }
]

export const OverviewOfOrganizations = () => {
  return (
    <Table className="bg-background shadow-md">
      <TableCaption className="text-primary font-medium mt-0 caption-top">Overview of organizations and their performance.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Restaurants</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total Earnings</TableHead>
          <TableHead>Creation Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((org) => (
          <TableRow key={org.organization}>
            <TableCell className="font-medium">{org.organization}</TableCell>
            <TableCell className="font-medium">{org.restaurants}</TableCell>
            <TableCell className="font-medium">
              <Badge className={`${org.status === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"} rounded`}>{org.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{org.totalEarnings}</TableCell>
            <TableCell className="font-medium">{new Date(org.creationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Earnings</TableCell>
          <TableCell className="text-right">
            {organizations.reduce((acc, org) => acc + parseFloat(org.totalEarnings.replace(/[$,]/g, "")), 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableFooter> */}
    </Table>
  )
}
