import { MenuItem } from "@/types/sidebarTypes"
import { Home, Utensils, ClipboardList, Box, Layout, Users, User, LayoutDashboard, Wallet, UserRoundCog, Milestone, Package, HandPlatter, ChartColumnBig, Network, HardHat } from "lucide-react"

export const menuItems: MenuItem[] = [
  {
    title: "Tableau de bord",
    url: "/o",
    icon: LayoutDashboard,
    subItems: []
  },
  {
    title: "Gest. commerciale",
    url: null,
    icon: Home,
    subItems: [
      {
        title: "Organisations",
        url: "/o/organizations",
        icon: Network,
      },
      {
        title: "Restaurants",
        url: "/o/restaurants",
        icon: Utensils,
      },
      {
        title: "Produits",
        url: "/o/products",
        icon: Box,
      },
      {
        title: "Tables",
        url: "/o/tables",
        icon: Layout,
      },
      {
        title: "Orders",
        url: "/o/orders",
        icon: HandPlatter,
      }
    ]
  },
  {
    title: "Gest. clients",
    url: null,
    icon: Users,
    subItems: [
      {
        title: "Clients",
        url: "/o/clients",
        icon: User,
        subItems: []
      },
      {
        title: "Comptes",
        url: "/o/accounts",
        icon: Wallet,
        subItems: []
      }
    ]
  },
  {
    title: "Users & sécurités",
    url: null,
    icon: UserRoundCog,
    subItems: [
      {
        title: "Utilisateurs",
        url: "/o/users",
        icon: HardHat,
        subItems: []
      },
      {
        title: "Role & permi.",
        url: "/o/role-permission",
        icon: Milestone,
        subItems: []
      },
      {
        title: "module",
        url: "/o/module",
        icon: Package,
        subItems: []
      }
    ]
  },
  {
    title: "Enquêtes & Analy.",
    url: null,
    icon: ChartColumnBig,
    subItems: [
      {
        title: "Enquêtes",
        url: "/o/surveys",
        icon: ClipboardList,
        subItems: []
      }
    ]
  }
]
