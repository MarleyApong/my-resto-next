import { MenuItem } from "@/types/sidebarTypes"
import { SidebarSubItems } from "./SidebarSubItem"
import { SidebarMenuItem, SidebarMenuButton } from "../../ui/sidebar"
import { Plus, Minus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarItemProps {
  item: MenuItem
  isOpen: boolean
  onToggle: (title: string) => void
}

export const SidebarItem = ({ item, isOpen, onToggle }: SidebarItemProps) => {
  const pathname = usePathname()
  
  const isActive =
    pathname === item.url ||
    item.subItems.some((subItem) => pathname === subItem.url)

  const renderNavLink = () => {
    const activeClass = isActive ? "bg-gray-200" : ""

    if (item.url) {
      return (
        <Link 
          href={item.url}
          onClick={() => onToggle(item.title)}
          className={`flex items-center justify-between mb-2 p-2 rounded ${activeClass}`}
        >
          <div className="flex items-center font-semibold">
            <item.icon size={20} />
            <span className="ml-2">{item.title}</span>
          </div>
          {item.subItems.length > 0 &&
            (isOpen ? <Minus size={14} /> : <Plus size={14} />)}
        </Link>
      )
    }

    return (
      <button
        type="button"
        className={`w-full flex items-center justify-between mb-2 p-2 rounded ${activeClass}`}
        onClick={() => onToggle(item.title)}
      >
        <div className="flex items-center font-semibold">
          <item.icon size={20} />
          <span className="ml-2">{item.title}</span>
        </div>
        {item.subItems.length > 0 &&
          (isOpen ? <Minus size={14} /> : <Plus size={14} />)}
      </button>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>{renderNavLink()}</SidebarMenuButton>
      {item.subItems.length > 0 && isOpen && <SidebarSubItems items={item.subItems} />}
    </SidebarMenuItem>
  )
}