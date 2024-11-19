import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const tablePerformanceData = [
  {
    table: "Table 15",
    section: "Terrasse",
    status: "Active",
    orders: 245,
    revenue: 12350,
    averagePerOrder: 50.4
  },
  {
    table: "Table 8",
    section: "Intérieur",
    status: "Active",
    orders: 230,
    revenue: 11500,
    averagePerOrder: 50.0
  },
  {
    table: "Table 3",
    section: "Terrasse",
    status: "Active",
    orders: 210,
    revenue: 10500,
    averagePerOrder: 50.0
  },
  {
    table: "Table 12",
    section: "Intérieur",
    status: "Inactive",
    orders: 195,
    revenue: 9750,
    averagePerOrder: 50.0
  },
  {
    table: "Table 6",
    section: "Bar",
    status: "Active",
    orders: 180,
    revenue: 9000,
    averagePerOrder: 50.0
  },
  {
    table: "Table 9",
    section: "Terrasse",
    status: "Active",
    orders: 175,
    revenue: 8750,
    averagePerOrder: 50.0
  },
  {
    table: "Table 4",
    section: "Intérieur",
    status: "Active",
    orders: 160,
    revenue: 8000,
    averagePerOrder: 50.0
  },
  {
    table: "Table 7",
    section: "Bar",
    status: "Inactive",
    orders: 155,
    revenue: 7750,
    averagePerOrder: 50.0
  },
  {
    table: "Table 1",
    section: "Terrasse",
    status: "Active",
    orders: 150,
    revenue: 7500,
    averagePerOrder: 50.0
  },
  {
    table: "Table 5",
    section: "Intérieur",
    status: "Active",
    orders: 145,
    revenue: 7250,
    averagePerOrder: 50.0
  }
]

export const Overview = () => {
  return (
    <Table className="bg-background shadow-md">
      <TableCaption className="text-primary font-medium mb-2 caption-top">
        Performance des tables du restaurant
      </TableCaption>
      <TableHeader className="shadow-md">
        <TableRow>
          <TableHead>Table</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Commandes</TableHead>
          <TableHead className="text-right">CA Total</TableHead>
          <TableHead className="text-right">Moyenne/Commande</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tablePerformanceData.map((table, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{table.table}</TableCell>
            <TableCell>{table.section}</TableCell>
            <TableCell>
              <Badge 
                className={`${
                  table.status === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                } rounded`}
              >
                {table.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{table.orders}</TableCell>
            <TableCell className="text-right font-medium">{table.revenue}€</TableCell>
            <TableCell className="font-medium text-right">{table.averagePerOrder.toFixed(1)}€</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default Overview;