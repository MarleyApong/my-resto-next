"use client"

import { CheckboxTree, SelectableList, SelectableListItemProps } from "@/components/features/DataTransfer"
import Level2 from "@/components/features/Level2"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { menuItems } from "@/data/mainMenu"
import React, { useState } from "react"

interface TabsData {
  value: string
  label: string
  content: React.ReactNode
}

const permissions: SelectableListItemProps[] = [
  { id: 1, roleId: 101, name: "Admin Access" },
  { id: 2, roleId: 102, name: "Editor Access" },
  { id: 3, roleId: 103, name: "Viewer Access" },
]

const ModuleAndPermission = () => {
  const [organization, setOrganization] = useState<string>("")
  const [menu, setMenu] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handleTabChange = (tabValue: string) => {
    setSelectedTab(tabValue)
  }

  const handlePermissionsChange = (selectedIds: string[]) => {
    setSelectedPermissions(selectedIds)
  }

  const tabs: TabsData[] = [
    {
      value: "organization",
      label: "Organization Module",
      content: (
        <div className="bg-background p-2 shadow-md rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Label>Organization</Label>
            <Select value={organization} onValueChange={(value) => setOrganization(value)}>
              <SelectTrigger className="flex- w-auto">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">Maison du goût</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="">
            <CheckboxTree data={menuItems} onSelectionChange={handlePermissionsChange} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Button className="">Attribute</Button>
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
            <Select value={organization} onValueChange={(value) => setOrganization(value)}>
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
            <CheckboxTree data={menuItems} onSelectionChange={handlePermissionsChange} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Button className="">Attribute</Button>
          </div>
        </div>
      )
    },
    {
      value: "role-permission",
      label: "Attribute permission to Role",
      content: (
        <div className="bg-background p-2 shadow-md rounded-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Label>Role</Label>
              <Select value={organization} onValueChange={(value) => setOrganization(value)}>
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
              <Select value={menu} onValueChange={(value) => setMenu(value)}>
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
            <SelectableList data={permissions} onSelectionChange={handlePermissionsChange} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Button className="">Attribute</Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <div>
      <Level2 title="Roles & Permissions"></Level2>
      <Tabs value={selectedTab || tabs[0].value} onValueChange={(value) => setSelectedTab(value)} className="w-full">
        <TabsList className="flex justify-start gap-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} onClick={() => handleTabChange(tab.value)} className="px-4 py-1 text-sm font-medium text-gray-900 ">
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
