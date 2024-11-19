import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const surveys = [
  {
    survey: "Survey A",
    restaurant: "Restaurant A",
    status: "Active",
    averageRating: 4.5,
    reviewsCount: 120,
    creationDate: "2020-05-12"
  },
  {
    survey: "Survey B",
    restaurant: "Restaurant B",
    status: "Inactive",
    averageRating: 3.8,
    reviewsCount: 85,
    creationDate: "2021-08-25"
  },
  {
    survey: "Survey C",
    restaurant: "Restaurant C",
    status: "Active",
    averageRating: 4.0,
    reviewsCount: 95,
    creationDate: "2019-03-18"
  },
  {
    survey: "Survey D",
    restaurant: "Restaurant D",
    status: "Active",
    averageRating: 4.7,
    reviewsCount: 150,
    creationDate: "2022-01-10"
  },
  {
    survey: "Survey E",
    restaurant: "Restaurant E",
    status: "Inactive",
    averageRating: 3.5,
    reviewsCount: 45,
    creationDate: "2021-11-22"
  }
]

export const OverviewOfSurveys = () => {
  return (
    <Table className="bg-background shadow-md">
      <TableCaption className="text-primary font-medium mt-0 caption-top">Overview of surveys and their performance.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Survey</TableHead>
          <TableHead>Restaurant</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Average Rating</TableHead>
          <TableHead className="text-right">Reviews Count</TableHead>
          <TableHead className="text-right">Creation Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {surveys.map((survey, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{survey.survey}</TableCell>
            <TableCell>{survey.restaurant}</TableCell>
            <TableCell>
              <Badge className={`${survey.status === "Active" ? "bg-green-500 text-white" : "bg-red-500 text-white"} rounded`}>{survey.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium">{survey.averageRating.toFixed(1)}</TableCell>
            <TableCell className="text-right font-medium">{survey.reviewsCount}</TableCell>
            <TableCell className="font-medium text-right">{new Date(survey.creationDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
