import { useState, useEffect } from "react"
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
  selectedIds?: string[] // Add selectedIds to the props
  onSelectionChange: (selectedIds: string[]) => void
}

export const CheckboxTree = ({ data, selectedIds = [], onSelectionChange }: CheckboxTreeProps) => {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds)
  const [selectAll, setSelectAll] = useState(false)

  // Sync internalSelectedIds with the selectedIds prop
  useEffect(() => {
    setInternalSelectedIds(selectedIds)
  }, [selectedIds])

  const handleToggleAll = () => {
    const allIds = data.flatMap((item) => [item.id, ...item.subItems.map((subItem) => subItem.id)].filter((id): id is string => id !== null && id !== undefined))

    if (selectAll) {
      setInternalSelectedIds([])
    } else {
      setInternalSelectedIds(allIds)
    }

    setSelectAll(!selectAll)
    onSelectionChange(!selectAll ? allIds : [])
  }

  const handleToggleItem = (parentId: string | null) => {
    if (!parentId) return

    const parent = data.find((item) => item.id === parentId)
    if (!parent) return

    const allIds = [parentId, ...parent.subItems.map((subItem) => subItem.id)].filter((id): id is string => id !== null && id !== undefined)

    const isParentSelected = internalSelectedIds.includes(parentId)
    const newSelectedIds = isParentSelected
      ? internalSelectedIds.filter((id) => !allIds.includes(id)) // Remove parent and its children
      : [...internalSelectedIds, ...allIds] // Add parent and its children

    setInternalSelectedIds(newSelectedIds)
    onSelectionChange(newSelectedIds)
  }

  const handleToggleSubItem = (parentId: string | null, subItemId: string | null) => {
    if (!subItemId) return

    let newSelectedIds = [...internalSelectedIds]

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

    setInternalSelectedIds(newSelectedIds)
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
            <Checkbox checked={item.id ? internalSelectedIds.includes(item.id) : false} onCheckedChange={() => handleToggleItem(item.id)} />
            <Label htmlFor={`item-${item.id ?? ""}`}>{item.title}</Label>
          </div>
          {item.subItems &&
            item.subItems.map((subItem) => (
              <div key={subItem.id ?? ""} className="ml-4 flex items-center gap-2 mb-1">
                <Checkbox checked={subItem.id ? internalSelectedIds.includes(subItem.id) : false} onCheckedChange={() => handleToggleSubItem(item.id, subItem.id)} />
                <Label htmlFor={`subitem-${subItem.id ?? ""}`}>{subItem.title}</Label>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

export const SelectableList = ({ data, onSelectionChange }: SelectableListProps) => {
  // Transform data into a format compatible with `CheckboxTree`
  const transformedData = data.map((item) => ({
    id: String(item.id),
    title: item.name || "Untitled", // Ensure a default title
    url: null,
    subItems: [] // No sub-items in this case
  }))

  return <CheckboxTree data={transformedData} onSelectionChange={onSelectionChange} />
}