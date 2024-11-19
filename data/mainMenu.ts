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
    url: "/organisations",
    icon: Building,
    subItems: []
  },
  {
    title: "Restaurants",
    url: "/restaurants",
    icon: Utensils,
    subItems: []
  },
  {
    title: "Enquêtes",
    url: "/surveys",
    icon: ClipboardList,
    subItems: []
  },
  {
    title: "Produits",
    url: "/products",
    icon: Box,
    subItems: []
  },
  {
    title: "Tables",
    url: "/tables",
    icon: Layout,
    subItems: []
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
    subItems: []
  },
  {
    title: "Utilisateurs",
    url: "/users",
    icon: User,
    subItems: []
  }
]
