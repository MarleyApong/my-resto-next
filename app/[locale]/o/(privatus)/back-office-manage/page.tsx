"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { CheckboxTree, SelectableList, SelectableListItemProps } from "@/components/features/DataTransfer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Combobox } from "@/components/features/Combobox"
import { roleService } from "@/services/roleService"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Loader } from "@/components/features/SpecificalLoader"
import { PlugZap } from "lucide-react"
import { menuItems } from "@/data/mainMenu"

interface Permission {
  create: boolean
  view: boolean
  update: boolean
  delete: boolean
}

interface SpecificPermission {
  id: string
  name: string
  granted: boolean
}

interface Role {
  id: string
  name: string
  menus: string[]
  permissions?: {
    [menuId: string]: {
      permissions: Permission
      specificPermissions: SpecificPermission[]
    }
  }
}

interface TabsData {
  value: string
  label: string
  content: React.ReactNode
}

const BackOfficeManage = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading } = useAuth()

  // State for Tab 1: Menu - Role
  const [rolesTab1, setRolesTab1] = useState<Role[]>([])
  const [selectedRoleTab1, setSelectedRoleTab1] = useState<string>("")
  const [selectedMenuIdsTab1, setSelectedMenuIdsTab1] = useState<string[]>([])

  // State for Tab 2: Permission - Role
  const [rolesTab2, setRolesTab2] = useState<Role[]>([])
  const [selectedRoleTab2, setSelectedRoleTab2] = useState<string>("")
  const [selectedMenuTab2, setSelectedMenuTab2] = useState<string>("")
  const [permissionsTab2, setPermissionsTab2] = useState<Permission>({ create: false, view: false, update: false, delete: false })
  const [specificPermissionsTab2, setSpecificPermissionsTab2] = useState<SpecificPermission[]>([])

  // Fetch all roles
  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await roleService.getRolesBackOffice()
      setRolesTab1(res.data)
      setRolesTab2(res.data)
    } catch (e) {
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  // Fetch specific permissions for a menu
  const fetchSpecificPermissions = useCallback(
    async (menuId: string) => {
      setIsLoading(true)
      try {
        const res = await roleService.getRolesBackOffice()
        setSpecificPermissionsTab2(res.data)
      } catch (e) {
        console.error("Failed to fetch specific permissions:", e)
        showError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [showError]
  )

  // Fetch data on component mount
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Handle role change in Tab 1
  useEffect(() => {
    if (selectedRoleTab1) {
      const role = rolesTab1.find((role) => role.id === selectedRoleTab1)
      if (role) {
        setSelectedMenuIdsTab1(role.menus || [])
      }
    } else {
      setSelectedMenuIdsTab1([])
    }
  }, [selectedRoleTab1, rolesTab1])

  // Handle role change in Tab 2
  useEffect(() => {
    if (selectedRoleTab2) {
      const role = rolesTab2.find((role) => role.id === selectedRoleTab2)
      if (role) {
        setSelectedMenuTab2("")
        setPermissionsTab2({ create: false, view: false, update: false, delete: false })
        setSpecificPermissionsTab2([])
      }
    } else {
      setSelectedMenuTab2("")
      setPermissionsTab2({ create: false, view: false, update: false, delete: false })
      setSpecificPermissionsTab2([])
    }
  }, [selectedRoleTab2, rolesTab2])

  // Handle menu change in Tab 2
  useEffect(() => {
    if (selectedMenuTab2) {
      fetchSpecificPermissions(selectedMenuTab2)
    } else {
      setSpecificPermissionsTab2([])
    }
  }, [selectedMenuTab2, fetchSpecificPermissions])

  // Handle menu selection in Tab 1
  const handleMenuSelectionTab1 = useCallback((selectedIds: string[]) => {
    setSelectedMenuIdsTab1(selectedIds)
  }, [])

  // Handle permission change in Tab 2
  const handlePermissionChangeTab2 = useCallback((permission: keyof Permission, value: boolean) => {
    setPermissionsTab2((prev) => ({ ...prev, [permission]: value }))
  }, [])

  // Handle specific permission change in Tab 2
  const handleSpecificPermissionChangeTab2 = useCallback((index: number, value: boolean) => {
    setSpecificPermissionsTab2((prev) => {
      const newSpecificPermissions = [...prev]
      newSpecificPermissions[index].granted = value
      return newSpecificPermissions
    })
  }, [])

  // Handle assigning menus to role in Tab 1
  const handleAssignMenusToRoleTab1 = useCallback(async () => {
    if (!selectedRoleTab1) {
      toast.warning("Please select a role first.")
      return
    }

    setIsLoading(true)
    try {
      await roleService.assignMenusToRole(selectedRoleTab1, selectedMenuIdsTab1)
      toast.success("Menus assigned successfully!")
      fetchRoles()
    } catch (e) {
      console.error("Failed to assign menus to role:", e)
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [selectedRoleTab1, selectedMenuIdsTab1, fetchRoles, showError])

  // Handle assigning permissions to role in Tab 2
  const handleAssignPermissionsToRoleTab2 = useCallback(async () => {
    if (!selectedRoleTab2 || !selectedMenuTab2) {
      toast.warning("Please select a role and a menu first.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/roles/${selectedRoleTab2}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          menuId: selectedMenuTab2,
          specificPermissions: specificPermissionsTab2
        })
      })
      if (!response.ok) throw new Error("Failed to assign permissions")
      toast.success("Permissions assigned successfully!")
      fetchRoles()
    } catch (e) {
      console.error("Failed to assign permissions:", e)
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [selectedRoleTab2, selectedMenuTab2, specificPermissionsTab2, fetchRoles, showError])

  // Tabs configuration
  const tabs: TabsData[] = useMemo(
    () => [
      {
        value: "menu-role",
        label: "Menu - Role",
        content: (
          <div className="bg-background p-2 shadow-md rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <Label>Role</Label>
              <Combobox
                options={rolesTab1.map((role) => ({ value: role.id, label: role.name }))}
                value={selectedRoleTab1}
                onValueChange={setSelectedRoleTab1}
                placeholder="Select role"
                className="w-auto"
              />
            </div>
            <div className="">
              <CheckboxTree data={menuItems} selectedIds={selectedMenuIdsTab1} onSelectionChange={handleMenuSelectionTab1} />
            </div>
            <div className="flex gap-2 items-center mt-2">
              <Button
                onClick={handleAssignMenusToRoleTab1}
                disabled={
                  !selectedRoleTab1 ||
                  isLoading ||
                  selectedMenuIdsTab1.length === 0 ||
                  JSON.stringify(selectedMenuIdsTab1) === JSON.stringify(rolesTab1.find((role) => role.id === selectedRoleTab1)?.menus || [])
                }
                variant={rolesTab1.find((role) => role.id === selectedRoleTab1)?.menus?.length === 0 ? "default" : "sun"}
              >
                {isLoading ? <Loader /> : <PlugZap />}
                {rolesTab1.find((role) => role.id === selectedRoleTab1)?.menus?.length === 0 ? "Assign" : "Update"}
              </Button>
            </div>
          </div>
        )
      },
      {
        value: "permission-role",
        label: "Permission - Role",
        content: (
          <div className="bg-background p-2 shadow-md rounded-sm">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Label>Role</Label>
                <Combobox
                  options={rolesTab2.map((role) => ({ value: role.id, label: role.name }))}
                  value={selectedRoleTab2}
                  onValueChange={setSelectedRoleTab2}
                  placeholder="Select role"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Menu</Label>
                <Combobox
                  options={selectedRoleTab2 ? rolesTab2.find((role) => role.id === selectedRoleTab2)?.menus.map((menuId) => ({ value: menuId, label: menuId })) || [] : []}
                  value={selectedMenuTab2}
                  onValueChange={setSelectedMenuTab2}
                  placeholder="Select menu"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Permissions</Label>
              <div className="flex flex-col gap-4 mt-2 ml-2">
                {Object.entries(permissionsTab2).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={value} onChange={(e) => handlePermissionChangeTab2(key as keyof Permission, e.target.checked)} />
                    <Label>{key}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Label>Specific Permissions</Label>
              <div className="flex flex-col gap-4 mt-2 ml-2">
                {specificPermissionsTab2.map((permission, index) => (
                  <div key={permission.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={permission.granted} onChange={(e) => handleSpecificPermissionChangeTab2(index, e.target.checked)} />
                    <Label>{permission.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center mt-2">
              <Button onClick={handleAssignPermissionsToRoleTab2} disabled={!selectedRoleTab2 || !selectedMenuTab2 || isLoading}>
                {isLoading ? <Loader /> : <PlugZap />}
                Assign
              </Button>
            </div>
          </div>
        )
      }
    ],
    [
      rolesTab1,
      selectedRoleTab1,
      selectedMenuIdsTab1,
      handleMenuSelectionTab1,
      handleAssignMenusToRoleTab1,
      rolesTab2,
      selectedRoleTab2,
      selectedMenuTab2,
      permissionsTab2,
      specificPermissionsTab2,
      handlePermissionChangeTab2,
      handleSpecificPermissionChangeTab2,
      handleAssignPermissionsToRoleTab2,
      isLoading
    ]
  )

  return (
    <div>
      <Tabs defaultValue="menu-role" className="w-full">
        <TabsList className="flex justify-start gap-4 border-b border-gray-300 bg-white">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4 py-1 text-sm font-medium text-gray-900 data-[state=active]:bg-primary data-[state=active]:text-white">
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

export default BackOfficeManage
