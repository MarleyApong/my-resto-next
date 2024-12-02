import { MenuItem } from "@/types/sidebarTypes"
import { Home, Utensils, ClipboardList, Box, Layout, Users, User, LayoutDashboard, Wallet, UserRoundCog, Milestone, Package, HandPlatter, ChartColumnBig, Network, HardHat, Store } from "lucide-react"

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Tableau de bord",
    url: "/o",
    icon: LayoutDashboard,
    subItems: []
  },
  {
    id: "main-manager",
    title: "Gest. commerciale",
    url: null,
    icon: Home,
    subItems: [
      {
        id: "organizations",
        title: "Organisations",
        url: "/o/organizations",
        icon: Network,
      },
      {
        id: "restaurants",
        title: "Restaurants",
        url: "/o/restaurants",
        icon: Utensils,
      },
      {
        id: "products",
        title: "Produits",
        url: "/o/products",
        icon: Box,
      },
      {
        id: "tables",
        title: "Tables",
        url: "/o/tables",
        icon: Layout,
      },
      {
        id: "orders",
        title: "Orders",
        url: "/o/orders",
        icon: HandPlatter,
      }
    ]
  },
  {
    id: "manage-customer",
    title: "Gest. clients",
    url: null,
    icon: Users,
    subItems: [
      {
        id: "customers",
        title: "Clients",
        url: "/o/customers",
        icon: User,
        subItems: []
      },
      {
        id: "accounts",
        title: "Comptes",
        url: "/o/accounts",
        icon: Wallet,
        subItems: []
      },
      {
        id: "operations",
        title: "Operations cpte",
        url: "/o/account-operations",
        icon: Store,
        subItems: []
      }
    ]
  },
  {
    id: "security",
    title: "Sécurités",
    url: null,
    icon: UserRoundCog,
    subItems: [
      {
        id: "employees",
        title: "Employes",
        url: "/o/users",
        icon: HardHat,
        subItems: []
      },
      {
        id: "role",
        title: "Roles",
        url: "/o/roles",
        icon: Milestone,
        subItems: []
      },
      {
        id: "modules-permissions",
        title: "modules & permi.",
        url: "/o/modules-permissions",
        icon: Package,
        subItems: []
      }
    ]
  },
  {
    id: "surveys-statistics",
    title: "Enquêtes & Analy.",
    url: null,
    icon: ChartColumnBig,
    subItems: [
      {
        id: "surveys",
        title: "Enquêtes",
        url: "/o/surveys",
        icon: ClipboardList,
        subItems: []
      }
    ]
  }
]
