import { MenuItem } from "@/types/sidebarTypes"
import { Home, Building, Utensils, ClipboardList, Box, Layout, Users, User } from "lucide-react"

export const menuItems: MenuItem[] = [
  {
    title: "Tableau de bord",
    url: "/o",
    icon: Home,
    subItems: []
  },
  {
    title: "Organisations",
    url: "/o/organizations",
    icon: Building,
    subItems: []
  },
  {
    title: "Restaurants",
    url: "/o/restaurants",
    icon: Utensils,
    subItems: []
  },
  {
    title: "Enquêtes",
    url: "/o/surveys",
    icon: ClipboardList,
    subItems: []
  },
  {
    title: "Produits",
    url: "/o/products",
    icon: Box,
    subItems: []
  },
  {
    title: "Tables",
    url: "/o/tables",
    icon: Layout,
    subItems: []
  },
  {
    title: "Clients",
    url: "/o/clients",
    icon: Users,
    subItems: []
  },
  {
    title: "Utilisateurs",
    url: "/o/users",
    icon: User,
    subItems: []
  }
]
