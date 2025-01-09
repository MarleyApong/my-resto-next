"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { CheckboxTree, SelectableList, SelectableListItemProps } from "@/components/features/DataTransfer"
import { Level2 } from "@/components/features/Level2"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { menuItems } from "@/data/mainMenu"
import { OrganizationType } from "@/types/organization"
import { organizationService } from "@/services/organizationService"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { PlugZap } from "lucide-react"
import { Loader } from "@/components/features/SpecificalLoader"
import { Combobox } from "@/components/features/Combobox"

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
  const [backendMenuIds, setBackendMenuIds] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState<string | null>(null)

  // Fetch organizations and their assigned menus
  const fetchOrganizationsAndMenus = useCallback(async () => {
    setIsLoading(true)

    try {
      const res = await organizationService.getOrganizationsAndMenus()
      setOrganizations(res.data)
    } catch (e) {
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, showError])

  // Fetch data on component mount
  useEffect(() => {
    fetchOrganizationsAndMenus()
  }, [fetchOrganizationsAndMenus])

  // Fetch menu IDs for the selected organization
  useEffect(() => {
    if (selectedOrganization) {
      const org = organizations.find((org) => org.id === selectedOrganization)
      if (org) {
        const menuIds = org.menuIds || []
        setBackendMenuIds(menuIds)
        setSelectedMenuIds(menuIds)
      }
    } else {
      setBackendMenuIds([])
      setSelectedMenuIds([])
    }
  }, [selectedOrganization, organizations])

  // Handle menu selection in the CheckboxTree
  const handleMenuSelection = useCallback(
    (selectedIds: string[]) => {
      if (JSON.stringify(selectedMenuIds) !== JSON.stringify(selectedIds)) {
        setSelectedMenuIds(selectedIds)
      }
    },
    [selectedMenuIds]
  )

  // Check if there are changes between selected and backend menu IDs
  const hasChanges = useCallback(() => {
    return (
      selectedMenuIds.length !== backendMenuIds.length || selectedMenuIds.some((id) => !backendMenuIds.includes(id)) || backendMenuIds.some((id) => !selectedMenuIds.includes(id))
    )
  }, [selectedMenuIds, backendMenuIds])

  // Handle assigning or updating menus for the selected organization
  const handleAssignOrUpdateMenus = useCallback(async () => {
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
  }, [selectedOrganization, selectedMenuIds, backendMenuIds, setIsLoading, fetchOrganizationsAndMenus, showError])

  // Handle tab change
  const handleTabChange = useCallback((tabValue: string) => {
    setSelectedTab(tabValue)
  }, [])

  // Determine button label and variant
  const buttonLabel = backendMenuIds.length === 0 ? "Assign" : "Update"
  const buttonVariant = backendMenuIds.length === 0 ? "default" : "sun"

  // Transform organizations into Combobox options
  const organizationOptions = useMemo(() => {
    return organizations.map((org) => ({
      value: org.id,
      label: org.name
    }))
  }, [organizations])

  // Tabs configuration
  const tabs: TabsData[] = useMemo(
    () => [
      {
        value: "organization",
        label: "Organization Module",
        content: (
          <div className="bg-background p-2 shadow-md rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <Label>Organization</Label>
              <Combobox
                options={organizationOptions}
                className="w-auto"
                value={selectedOrganization}
                onValueChange={(value) => {
                  if (value !== selectedOrganization) {
                    setSelectedOrganization(value)
                  }
                }}
                placeholder="Select organization"
              />
            </div>
            <div className="">
              <CheckboxTree
                key={selectedTab} // Réinitialise le composant lorsque l'onglet change
                data={menuItems}
                selectedIds={selectedMenuIds}
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
              <Combobox options={organizationOptions} value={selectedOrganization} onValueChange={setSelectedOrganization} placeholder="Select role" />
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
                <Combobox options={organizationOptions} value={selectedOrganization} onValueChange={setSelectedOrganization} placeholder="Select role" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Module/Menu</Label>
                <Combobox options={organizationOptions} value={selectedOrganization} onValueChange={setSelectedOrganization} placeholder="Select menu" />
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
    ],
    [selectedOrganization, selectedMenuIds, handleMenuSelection, handleAssignOrUpdateMenus, hasChanges, isLoading, buttonLabel, buttonVariant, organizationOptions, selectedTab]
  )

  return (
    <div>
      <Level2 />
      <Tabs value={selectedTab || tabs[0].value} onValueChange={(value) => setSelectedTab(value)} className="w-full">
        <TabsList className="flex justify-start gap-4 border-b border-gray-300 bg-white">
          {tabs.map((tab) => (
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
