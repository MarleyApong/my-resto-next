import { SubItem } from "@/types/sidebarTypes"
import { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuButton } from "../../ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/router"

interface SidebarSubItemsProps {
  items: SubItem[]
}

export const SidebarSubItems = ({ items }: SidebarSubItemsProps) => {
  const router = useRouter()

  return (
    <SidebarMenuSub>
      {items.map((subItem) => {
        const isSubItemActive = router.pathname === subItem.url
        const activeClass = isSubItemActive ? "bg-gray-100" : ""

        return (
          <SidebarMenuSubItem key={subItem.title}>
            <SidebarMenuButton asChild>
              <Link href={subItem.url} passHref>
                <a className={`flex items-center font-semibold gap-2 p-2 rounded ${activeClass}`}>
                  {subItem.icon && <subItem.icon size={14} />}
                  {subItem.title}
                </a>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuSubItem>
        )
      })}
    </SidebarMenuSub>
  )
}
