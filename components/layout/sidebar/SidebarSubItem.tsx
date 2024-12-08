import { SubItem } from "@/types/sidebarTypes"
import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuButton } from "../../ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarSubItemsProps {
  items: SubItem[]
  closeSidebar: () => void
}

export const SidebarSubItems = ({ items, closeSidebar }: SidebarSubItemsProps) => {
  const pathname = usePathname()

  const handleClick = () => {
    closeSidebar()
  }

  return (
    <SidebarMenuSub>
      {items.map((subItem) => {
        const isSubItemActive = pathname === subItem.url
        const activeClass = isSubItemActive ? "bg-[var(--sidebar-primary)] text-primary" : ""

        return (
          <SidebarMenuSubItem key={subItem.title}>
            <SidebarMenuButton asChild>
              <Link href={subItem.url} onClick={handleClick} className={`flex items-center gap-2 p-2 rounded ${activeClass}`} passHref>
                <span>{subItem.icon && <subItem.icon size={14} />}</span>
                {subItem.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuSubItem>
        )
      })}
    </SidebarMenuSub>
  )
}
