import { useState } from "react"
import { MenuItem } from "@/types/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "../ui/label"

export type SelectableListItemProps = {
  id: string | number
  roleId: string | number
  name: string
}

type SelectableListProps = {
  data: SelectableListItemProps[]
  onSelectionChange: (selectedIds: string[]) => void
}

type CheckboxTreeProps = {
  data: MenuItem[]
  onSelectionChange: (selectedIds: string[]) => void
}

export const CheckboxTree = ({ data, onSelectionChange }: CheckboxTreeProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const handleToggleAll = () => {
    const allIds = data.flatMap((item) => [item.id, ...item.subItems.map((subItem) => subItem.id)].filter((id): id is string => id !== null && id !== undefined))

    if (selectAll) {
      setSelectedIds([])
    } else {
      setSelectedIds(allIds)
    }

    setSelectAll(!selectAll)
    onSelectionChange(!selectAll ? allIds : [])
  }

  const handleToggleItem = (parentId: string | null) => {
    if (!parentId) return

    const parent = data.find((item) => item.id === parentId)
    if (!parent) return

    const allIds = [parentId, ...parent.subItems.map((subItem) => subItem.id)].filter((id): id is string => id !== null && id !== undefined)

    const isParentSelected = selectedIds.includes(parentId)
    const newSelectedIds = isParentSelected
      ? selectedIds.filter((id) => !allIds.includes(id)) // Remove parent and its children
      : [...selectedIds, ...allIds] // Add parent and its children

    setSelectedIds(newSelectedIds)
    onSelectionChange(newSelectedIds)
  }

  const handleToggleSubItem = (parentId: string | null, subItemId: string | null) => {
    if (!subItemId) return

    let newSelectedIds = [...selectedIds]

    if (newSelectedIds.includes(subItemId)) {
      // Remove child from selection
      newSelectedIds = newSelectedIds.filter((id) => id !== subItemId)
    } else {
      // Add child to selection
      newSelectedIds.push(subItemId)
    }

    // Update parent's state based on children's selection
    if (parentId) {
      const parent = data.find((item) => item.id === parentId)
      const childrenIds = parent?.subItems.map((subItem) => subItem.id).filter((id): id is string => id !== null && id !== undefined) || []

      const hasAnyChildSelected = childrenIds.some((childId) => newSelectedIds.includes(childId))

      if (hasAnyChildSelected && !newSelectedIds.includes(parentId)) {
        // Add parent if any child is selected
        newSelectedIds.push(parentId)
      } else if (!hasAnyChildSelected) {
        // Remove parent if no children are selected
        newSelectedIds = newSelectedIds.filter((id) => id !== parentId)
      }
    }

    setSelectedIds(newSelectedIds)
    onSelectionChange(newSelectedIds)
  }

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-sm shadow-sm overflow-x-auto overflow-y-scroll max-w-96">
      <div className="flex items-center gap-2 mb-3">
        <Checkbox checked={selectAll} onCheckedChange={handleToggleAll} />
        <Label htmlFor="all">All</Label>
      </div>
      {data.map((item) => (
        <div key={item.id ?? ""}>
          <div className="flex items-center gap-2 mb-2">
            <Checkbox checked={item.id ? selectedIds.includes(item.id) : false} onCheckedChange={() => handleToggleItem(item.id)} />
            <Label htmlFor={`item-${item.id ?? ""}`}>{item.title}</Label>
          </div>
          {item.subItems &&
            item.subItems.map((subItem) => (
              <div key={subItem.id ?? ""} className="ml-4 flex items-center gap-2 mb-1">
                <Checkbox checked={subItem.id ? selectedIds.includes(subItem.id) : false} onCheckedChange={() => handleToggleSubItem(item.id, subItem.id)} />
                <Label htmlFor={`subitem-${subItem.id ?? ""}`}>{subItem.title}</Label>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

export const SelectableList = ({ data, onSelectionChange }: SelectableListProps) => {
  // Transformation des données en un format compatible avec `DataTransfer`
  const transformedData = data.map((item) => ({
    id: String(item.id),
    title: item.name || "Untitled", // Assurez-vous d'avoir un titre par défaut
    url: null,
    subItems: [] // Pas de sous-éléments dans ce cas
  }))

  return <CheckboxTree data={transformedData} onSelectionChange={onSelectionChange} />
}
