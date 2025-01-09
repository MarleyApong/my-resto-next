"use client"

import React, { useState, useEffect } from "react"
import { CheckboxTree, SelectableList, SelectableListItemProps } from "@/components/features/DataTransfer"
import { Level2 } from "@/components/features/Level2"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { menuItems } from "@/data/mainMenu"
import { OrganizationType } from "@/types/organization"
import { organizationService } from "@/services/organizationService"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { PlugZap } from "lucide-react"
import { Loader } from "@/components/features/SpecificalLoader"

interface TabsData {
  value: string
  label: string
  content: React.ReactNode
}

const permissions: SelectableListItemProps[] = [
  { id: 1, roleId: 101, name: "Admin Access" },
  { id: 2, roleId: 102, name: "Editor Access" },
  { id: 3, roleId: 103, name: "Viewer Access" }
]

const ModuleAndPermission = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading } = useAuth()

  const [organizations, setOrganizations] = useState<OrganizationType[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<string>("")
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([])
  const [backendMenuIds, setBackendMenuIds] = useState<string[]>([]) // Track menu IDs from the backend
  const [selectedTab, setSelectedTab] = useState<string | null>(null)

  // Fetch organizations and their assigned menus
  const fetchOrganizationsAndMenus = async () => {
    setIsLoading(true)

    try {
      const res = await organizationService.getOrganizationsAndMenus()
      setOrganizations(res.data)
    } catch (e) {
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchOrganizationsAndMenus()
  }, [])

  // Fetch menu IDs for the selected organization
  useEffect(() => {
    if (selectedOrganization) {
      const org = organizations.find((org) => org.id === selectedOrganization)
      if (org) {
        // Initialize backendMenuIds and selectedMenuIds
        const menuIds = org.menuIds || [] // Handle null case
        setBackendMenuIds(menuIds)
        setSelectedMenuIds(menuIds)
      }
    } else {
      setBackendMenuIds([])
      setSelectedMenuIds([])
    }
  }, [selectedOrganization, organizations])

  // Handle menu selection in the CheckboxTree
  const handleMenuSelection = (selectedIds: string[]) => {
    setSelectedMenuIds(selectedIds)
  }

  // Check if there are changes between selected and backend menu IDs
  const hasChanges = () => {
    return (
      selectedMenuIds.length !== backendMenuIds.length || selectedMenuIds.some((id) => !backendMenuIds.includes(id)) || backendMenuIds.some((id) => !selectedMenuIds.includes(id))
    )
  }

  // Handle assigning or updating menus for the selected organization
  const handleAssignOrUpdateMenus = async () => {
    if (!selectedOrganization) {
      toast.warning("Please select an organization first.")
      return
    }

    setIsLoading(true)

    try {
      await organizationService.assignMenusToOrganization(selectedOrganization, selectedMenuIds)
      toast.success(backendMenuIds.length === 0 ? "Menus assigned successfully!" : "Menus updated successfully!")
      fetchOrganizationsAndMenus() // Refresh the data
    } catch (e) {
      console.error("Failed to assign/update menus:", e)
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue)
  }

  // Determine button label and variant
  const buttonLabel = backendMenuIds.length === 0 ? "Assign" : "Update"
  const buttonVariant = backendMenuIds.length === 0 ? "default" : "sun"

  // Tabs configuration
  const tabs: TabsData[] = [
    {
      value: "organization",
      label: "Organization Module",
      content: (
        <div className="bg-background p-2 shadow-md rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Label>Organization</Label>
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="flex- w-auto">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="">
            <CheckboxTree
              data={menuItems}
              selectedIds={selectedMenuIds} // Pass selectedMenuIds to CheckboxTree
              onSelectionChange={handleMenuSelection}
            />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Button onClick={handleAssignOrUpdateMenus} disabled={!selectedOrganization || !hasChanges()} variant={buttonVariant}>
              {isLoading ? <Loader /> : <PlugZap />}
              {buttonLabel}
            </Button>
          </div>
        </div>
      )
    },
    {
      value: "module-role",
      label: "Attribute Module to Role",
      content: (
        <div className="bg-background p-2 shadow-md rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Label>Role</Label>
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="flex- w-auto">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="chef">Chef</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="">
            <CheckboxTree data={menuItems} onSelectionChange={handleMenuSelection} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Button className="">Assign</Button>
          </div>
        </div>
      )
    },
    {
      value: "role-permission",
      label: "Attribute Permission to Role",
      content: (
        <div className="bg-background p-2 shadow-md rounded-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Label>Role</Label>
              <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                <SelectTrigger className="flex- w-auto">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Module/Menu</Label>
              <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                <SelectTrigger className="flex- w-auto">
                  <SelectValue placeholder="Select menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Organization</SelectItem>
                  <SelectItem value="chef">Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="">
            <SelectableList data={permissions} onSelectionChange={handleMenuSelection} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Button className="">Assign</Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <div>
      <Level2 />
      <Tabs value={selectedTab || tabs[0].value} onValueChange={(value) => setSelectedTab(value)} className="w-full">
        <TabsList className="flex justify-start gap-4 border-b border-gray-300 bg-white">
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className="px-4 py-1 text-sm font-medium text-gray-900 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-3">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default ModuleAndPermission
