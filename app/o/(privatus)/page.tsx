"use client"

import { CustomerStatistics } from "@/components/layout/dashboard/customer"
import { OrganizationStatistics } from "@/components/layout/dashboard/organization"
import { ProductStatistics } from "@/components/layout/dashboard/product"
import { RestaurantStatistics } from "@/components/layout/dashboard/restaurant"
import { SurveyStatistics } from "@/components/layout/dashboard/survey"
import { TableStatistics } from "@/components/layout/dashboard/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabsData {
  value: string
  label: string
  content: React.ReactNode
}

const tabs: TabsData[] = [
  { value: "organization", label: "Organisation", content: <OrganizationStatistics />},
  { value: "restaurant", label: "Restaurant", content: <RestaurantStatistics/> },
  { value: "survey", label: "Enquête", content: <SurveyStatistics/> },
  { value: "product", label: "Produit", content: <ProductStatistics/> },
  { value: "table", label: "Table", content: <TableStatistics/> },
  { value: "client", label: "Customer", content: <CustomerStatistics/> }
]

const Dashboard: React.FC = () => {
  return (
    <div className="pt-2">
      <Tabs defaultValue={tabs[0].value} className="w-full">
        <TabsList className="fixed top-16 flex justify-start gap-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Dashboard
