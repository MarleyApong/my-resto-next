"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { CheckboxTree, SelectableList, SelectableListItemProps } from "@/components/features/DataTransfer"
import { Level2 } from "@/components/features/Level2"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { menuItems } from "@/data/mainMenu"
import { OrganizationType } from "@/types/organization"
import { organizationService } from "@/services/organizationService"
import { roleService } from "@/services/roleService"
import { useError } from "@/hooks/useError"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { PlugZap } from "lucide-react"
import { Loader } from "@/components/features/SpecificalLoader"
import { Combobox } from "@/components/features/Combobox"
import { PermissionType, SpecificPermission } from "@/types/permission"
import { Checkbox } from "@/components/ui/checkbox"

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

// Filter menuItems based on menus
const filterMenuItemsByIds = (menuItems: any[], menus: string[]): any[] => {
  return menuItems
    .filter((item) => menus.includes(item.id))
    .map((item) => ({
      ...item,
      subItems: item.subItems.filter((subItem: any) => menus.includes(subItem.id))
    }))
    .filter((item) => item.subItems.length > 0 || menus.includes(item.id))
}

const ModuleAndPermission = () => {
  const { showError } = useError()
  const { setIsLoading, isLoading } = useAuth()

  // Global state for organizations
  const [organizations, setOrganizations] = useState<OrganizationType[]>([])

  // State for each tab
  const [orgTab1, setOrgTab1] = useState<string>("") // Tab 1: Organization Module
  const [orgTab2, setOrgTab2] = useState<string>("") // Tab 2: Attribute Module to Role
  const [orgTab3, setOrgTab3] = useState<string>("") // Tab 3: Attribute Permission to Role

  const [selectedTab, setSelectedTab] = useState<string>("organization") // Active tab

  // State for Tab 1
  const [selectedMenuIdsTab1, setSelectedMenuIdsTab1] = useState<string[]>([])
  const [backendMenuIdsTab1, setBackendMenuIdsTab1] = useState<string[]>([])

  // State for Tab 2
  const [selectedMenuIdsTab2, setSelectedMenuIdsTab2] = useState<string[]>([])
  const [backendMenuIdsTab2, setBackendMenuIdsTab2] = useState<string[]>([])
  const [rolesTab2, setRolesTab2] = useState<{ id: string; name: string; menus: string[] }[]>([])
  const [selectedRoleTab2, setSelectedRoleTab2] = useState<string>("")

  // State for Tab 3
  const [selectedMenuIdsTab3, setSelectedMenuIdsTab3] = useState<string[]>([])
  const [rolesTab3, setRolesTab3] = useState<{ id: string; name: string; menus: string[] }[]>([])
  const [selectedRoleTab3, setSelectedRoleTab3] = useState<string>("")
  const [menusTab3, setMenusTab3] = useState<{ id: string; name: string }[]>([])
  const [permissionsTab3, setPermissionsTab3] = useState<PermissionType>({ create: false, view: false, update: false, delete: false })
  const [specificPermissionsTab3, setSpecificPermissionsTab3] = useState<SpecificPermission[]>([])
  const [initialPermissionsTab3, setInitialPermissionsTab3] = useState<PermissionType>({ create: false, view: false, update: false, delete: false })
  const [initialSpecificPermissionsTab3, setInitialSpecificPermissionsTab3] = useState<SpecificPermission[]>([])

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

  // Fetch menu IDs for the selected organization in Tab 1
  useEffect(() => {
    if (orgTab1) {
      const org = organizations.find((org) => org.id === orgTab1)
      if (org) {
        const menus = org.menus || []
        setBackendMenuIdsTab1(menus)
        setSelectedMenuIdsTab1(menus)
      }
    } else {
      setBackendMenuIdsTab1([])
      setSelectedMenuIdsTab1([])
    }
  }, [orgTab1, organizations])

  // Fetch roles for the selected organization in Tab 2
  const fetchRolesByOrg = useCallback(
    async (orgId: string) => {
      setIsLoading(true)
      try {
        const res = await roleService.getRolesByOrg(orgId)
        setRolesTab2(res.data)
      } catch (e) {
        showError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [showError]
  )

  // Handle organization change in Tab 2
  useEffect(() => {
    if (orgTab2) {
      fetchRolesByOrg(orgTab2)
      const org = organizations.find((org) => org.id === orgTab2)
      if (org) {
        const menus = org.menus || []
        setBackendMenuIdsTab2(menus)
        setSelectedMenuIdsTab2([]) // Reset selections
      }
    } else {
      setRolesTab2([])
      setSelectedRoleTab2("")
      setBackendMenuIdsTab2([])
      setSelectedMenuIdsTab2([])
    }
  }, [orgTab2, organizations, fetchRolesByOrg])

  // Handle role change in Tab 2
  useEffect(() => {
    if (selectedRoleTab2) {
      const role = rolesTab2.find((role) => role.id === selectedRoleTab2)
      if (role) {
        setSelectedMenuIdsTab2(role.menus || []) // Pre-select role's menus
      }
    } else {
      setSelectedMenuIdsTab2([])
    }
  }, [selectedRoleTab2, rolesTab2])

  // Fetch roles for the selected organization in Tab 3
  const fetchRolesByOrgTab3 = useCallback(
    async (orgId: string) => {
      setIsLoading(true)
      try {
        const res = await roleService.getRolesByOrg(orgId)
        setRolesTab3(res.data)
      } catch (e) {
        showError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [showError]
  )

  // Fetch menus for the selected role in Tab 3
  const fetchMenusByRole = useCallback(
    async (roleId: string) => {
      setIsLoading(true)
      try {
        const res = await roleService.getMenusByRole(roleId)
        setMenusTab3(res.data.menus.map((menu: any) => ({ id: menu.id, name: menu.name })))
      } catch (e) {
        showError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [showError]
  )

  // Fetch permissions for the selected menu in Tab 3
  const fetchPermissionsByMenu = useCallback(
    async (menuId: string) => {
      setIsLoading(true)
      try {
        // Fetch available permissions for the menu
        const res = await roleService.getPermissionByMenu(menuId)

        // Fetch permissions attributed to the role for this menu
        if (selectedRoleTab3) {
          const res2 = await roleService.getPermissionAttibutedByMenu(selectedRoleTab3, menuId)

          // Update specific permissions with granted values
          const updatedSpecificPermissions = res.data.map((perm: SpecificPermission) => {
            const grantedPermission = res2.data.specificPermissions.find((grantedPerm: SpecificPermission) => grantedPerm.id === perm.id)
            return {
              ...perm,
              granted: grantedPermission ? grantedPermission.granted : false // Default value
            }
          })

          setSpecificPermissionsTab3(updatedSpecificPermissions)
          setInitialSpecificPermissionsTab3(updatedSpecificPermissions) // Update initial specific permissions

          // Update base permissions
          setPermissionsTab3(res2.data.permissions)
          setInitialPermissionsTab3(res2.data.permissions) // Update initial base permissions
        }
      } catch (e) {
        console.error("Failed to fetch permissions:", e)
        showError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedRoleTab3, showError]
  )

  // For base permissions
  const handleBasePermissionChange = (key: keyof PermissionType, checked: boolean) => {
    setPermissionsTab3((prev) => ({
      ...prev,
      [key]: checked
    }))
  }

  // For specific permissions
  const handleSpecificPermissionChange = (index: number, checked: boolean) => {
    setSpecificPermissionsTab3((prev) => prev.map((permission, idx) => (idx === index ? { ...permission, granted: checked } : permission)))
  }

  // Check if there are changes in permissions or specific permissions
  const hasChangesTab3 = useCallback(() => {
    const basePermissionsChanged = Object.keys(permissionsTab3).some((key) => permissionsTab3[key as keyof PermissionType] !== initialPermissionsTab3[key as keyof PermissionType])

    const specificPermissionsChanged = specificPermissionsTab3.some((perm, index) => perm.granted !== initialSpecificPermissionsTab3[index]?.granted)

    return basePermissionsChanged || specificPermissionsChanged
  }, [permissionsTab3, initialPermissionsTab3, specificPermissionsTab3, initialSpecificPermissionsTab3])

  // Handle menu change in Tab 3
  useEffect(() => {
    if (selectedMenuIdsTab3.length > 0) {
      fetchPermissionsByMenu(selectedMenuIdsTab3[0])
    } else {
      setPermissionsTab3({ create: false, view: false, update: false, delete: false })
      setSpecificPermissionsTab3([])
    }
  }, [selectedMenuIdsTab3, fetchPermissionsByMenu])

  // Handle organization change in Tab 3
  useEffect(() => {
    if (orgTab3) {
      fetchRolesByOrgTab3(orgTab3)
    } else {
      setRolesTab3([])
      setSelectedRoleTab3("")
      setMenusTab3([])
    }
  }, [orgTab3, fetchRolesByOrgTab3])

  // Handle role change in Tab 3
  useEffect(() => {
    if (selectedRoleTab3) {
      fetchMenusByRole(selectedRoleTab3)
    } else {
      setMenusTab3([])
    }
  }, [selectedRoleTab3])

  // Handle menu selection in Tab 1
  const handleMenuSelectionTab1 = useCallback((selectedIds: string[]) => {
    setSelectedMenuIdsTab1(selectedIds)
  }, [])

  // Handle menu selection in Tab 2
  const handleMenuSelectionTab2 = useCallback((selectedIds: string[]) => {
    setSelectedMenuIdsTab2(selectedIds)
  }, [])

  // Handle menu selection in Tab 3
  const handleMenuSelectionTab3 = useCallback((selectedIds: string[]) => {
    setSelectedMenuIdsTab3(selectedIds)
  }, [])

  // Check if there are changes between selected and backend menu IDs in Tab 1
  const hasChangesTab1 = useCallback(() => {
    return (
      selectedMenuIdsTab1.length !== backendMenuIdsTab1.length ||
      selectedMenuIdsTab1.some((id) => !backendMenuIdsTab1.includes(id)) ||
      backendMenuIdsTab1.some((id) => !selectedMenuIdsTab1.includes(id))
    )
  }, [selectedMenuIdsTab1, backendMenuIdsTab1])

  // Check if there are changes between selected and role's menu IDs in Tab 2
  const hasChangesTab2 = useCallback(() => {
    const role = rolesTab2.find((role) => role.id === selectedRoleTab2)
    if (!role) return false
    return (
      selectedMenuIdsTab2.length !== (role.menus?.length || 0) ||
      selectedMenuIdsTab2.some((id) => !role.menus?.includes(id)) ||
      role.menus?.some((id) => !selectedMenuIdsTab2.includes(id))
    )
  }, [selectedMenuIdsTab2, selectedRoleTab2, rolesTab2])

  // Handle assigning or updating menus for the selected organization in Tab 1
  const handleAssignOrUpdateMenusTab1 = useCallback(async () => {
    if (!orgTab1) {
      toast.warning("Please select an organization first.")
      return
    }

    setIsLoading(true)
    try {
      await organizationService.assignMenusToOrganization(orgTab1, selectedMenuIdsTab1)
      toast.success(backendMenuIdsTab1.length === 0 ? "Menus assigned successfully!" : "Menus updated successfully!")
      fetchOrganizationsAndMenus()
    } catch (e) {
      console.error("Failed to assign/update menus:", e)
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [orgTab1, selectedMenuIdsTab1, backendMenuIdsTab1, fetchOrganizationsAndMenus, showError])

  // Handle assigning menus to role in Tab 2
  const handleAssignMenusToRoleTab2 = useCallback(async () => {
    if (!orgTab2 || !selectedRoleTab2) {
      toast.warning("Please select an organization and a role first.")
      return
    }

    setIsLoading(true)
    try {
      await roleService.assignMenusToRoleOrganization(selectedRoleTab2, selectedMenuIdsTab2)
      toast.success(selectedMenuIdsTab2.length === 0 ? "Menus assigned successfully!" : "Menus updated successfully!")
      fetchRolesByOrg(orgTab2)
    } catch (e) {
      console.error("Failed to assign menus to role:", e)
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [orgTab2, selectedRoleTab2, selectedMenuIdsTab2, fetchRolesByOrg, showError])

  // Handle assigning permissions to role in Tab 3
  const handleAssignPermissionsToRoleTab3 = useCallback(async () => {
    if (!selectedRoleTab3 || !selectedMenuIdsTab3[0]) {
      toast.warning("Please select a role and a menu first.")
      return
    }

    setIsLoading(true)
    try {
      const res = await roleService.assignPermissionToRoleMenu(
        selectedRoleTab3, // roleId
        selectedMenuIdsTab3[0], // menuId
        permissionsTab3, // permissions
        specificPermissionsTab3 // specificPermissions
      )
      toast.success(res.data.message)

      // Refresh permissions
      await fetchPermissionsByMenu(selectedMenuIdsTab3[0])
    } catch (e) {
      console.error("Failed to assign permissions:", e)
      showError(e)
    } finally {
      setIsLoading(false)
    }
  }, [selectedRoleTab3, selectedMenuIdsTab3, permissionsTab3, specificPermissionsTab3, fetchPermissionsByMenu, showError])

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
              <Combobox options={organizationOptions} className="w-auto" value={orgTab1} onValueChange={setOrgTab1} placeholder="Select organization" />
            </div>
            <div className="">
              <CheckboxTree data={menuItems} selectedIds={selectedMenuIdsTab1} onSelectionChange={handleMenuSelectionTab1} />
            </div>
            <div className="flex gap-2 items-center mt-2">
              <Button onClick={handleAssignOrUpdateMenusTab1} disabled={!orgTab1 || !hasChangesTab1()} variant={backendMenuIdsTab1.length === 0 ? "default" : "sun"}>
                {isLoading ? <Loader /> : <PlugZap />}
                {backendMenuIdsTab1.length === 0 ? "Assign" : "Update"}
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
            <div className="flex gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Label>Organization</Label>
                <Combobox
                  options={organizationOptions}
                  className="w-auto"
                  value={orgTab2}
                  onValueChange={(value) => {
                    setOrgTab2(value)
                    setSelectedMenuIdsTab2([])
                  }}
                  placeholder="Select organization"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Role</Label>
                <Combobox
                  className="w-auto"
                  options={rolesTab2.map((role) => ({ value: role.id, label: role.name }))}
                  value={selectedRoleTab2}
                  onValueChange={setSelectedRoleTab2}
                  placeholder="Select role"
                />
              </div>
            </div>
            <div className="">
              <CheckboxTree data={filterMenuItemsByIds(menuItems, backendMenuIdsTab2)} selectedIds={selectedMenuIdsTab2} onSelectionChange={handleMenuSelectionTab2} />
            </div>
            <div className="flex gap-2 items-center mt-2">
              <Button
                onClick={handleAssignMenusToRoleTab2}
                disabled={!orgTab2 || !selectedRoleTab2 || !hasChangesTab2() || isLoading}
                variant={selectedMenuIdsTab2.length === 0 ? "default" : "sun"}
              >
                {isLoading ? <Loader /> : <PlugZap />}
                {selectedMenuIdsTab2.length === 0 ? "Assign" : "Update"}
              </Button>
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
                <Label>Organization</Label>
                <Combobox options={organizationOptions} className="w-auto" value={orgTab3} onValueChange={setOrgTab3} placeholder="Select organization" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Role</Label>
                <Combobox
                  className="w-auto"
                  options={rolesTab3.map((role) => ({ value: role.id, label: role.name }))}
                  value={selectedRoleTab3}
                  onValueChange={setSelectedRoleTab3}
                  placeholder="Select role"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Module/Menu</Label>
                <Combobox
                  className="w-auto"
                  options={menusTab3.map((menu) => ({ value: menu.id, label: menu.name }))}
                  value={selectedMenuIdsTab3[0] || ""}
                  onValueChange={(value) => setSelectedMenuIdsTab3([value])}
                  placeholder="Select menu"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Permissions</Label>
              {selectedMenuIdsTab3.length > 0 && (
                <div className="flex flex-col gap-4 mt-2 ml-2">
                  {Object.entries(permissionsTab3).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox checked={value} onCheckedChange={(checked) => handleBasePermissionChange(key as keyof PermissionType, checked as boolean)} />
                      <Label>{key}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Label>Specific Permissions</Label>
              {selectedMenuIdsTab3.length > 0 && (
                <div className="flex flex-col gap-4 mt-2 ml-2">
                  {specificPermissionsTab3.map((permission, index) => (
                    <div key={permission.id} className="flex items-center gap-2">
                      <Checkbox checked={permission.granted} onCheckedChange={(checked) => handleSpecificPermissionChange(index, checked as boolean)} />
                      <Label>{permission.name}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center mt-2">
              <Button
                onClick={handleAssignPermissionsToRoleTab3}
                disabled={!selectedRoleTab3 || !selectedMenuIdsTab3[0] || isLoading || !hasChangesTab3()}
                variant={hasChangesTab3() ? "sun" : "default"}
              >
                {isLoading ? <Loader /> : <PlugZap />}
                {hasChangesTab3() ? "Update" : "Assign"}
              </Button>
            </div>
          </div>
        )
      }
    ],
    [
      orgTab1,
      orgTab2,
      orgTab3,
      selectedMenuIdsTab1,
      selectedMenuIdsTab2,
      selectedMenuIdsTab3,
      handleMenuSelectionTab1,
      handleMenuSelectionTab2,
      handleMenuSelectionTab3,
      handleAssignOrUpdateMenusTab1,
      handleAssignMenusToRoleTab2,
      hasChangesTab1,
      hasChangesTab2,
      isLoading,
      organizationOptions,
      rolesTab2,
      rolesTab3,
      selectedRoleTab2,
      selectedRoleTab3,
      backendMenuIdsTab1,
      backendMenuIdsTab2,
      menusTab3,
      permissionsTab3,
      specificPermissionsTab3,
      handleBasePermissionChange,
      handleSpecificPermissionChange,
      handleAssignPermissionsToRoleTab3,
      hasChangesTab3
    ]
  )

  return (
    <div>
      <Level2 />
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="flex justify-start gap-4 border-b border-gray-300 bg-white">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => setSelectedTab(tab.value)}
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
