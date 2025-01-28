import { MenuItem } from "@/types/sidebar"
import { Home, Utensils, ClipboardList, Box, Layout, Users, User, LayoutDashboard, Wallet, UserRoundCog, Milestone, Package, HandPlatter, ChartColumnBig, Network, HardHat, Store, AppWindow, Keyboard } from "lucide-react"

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Tableau de bord",
    url: "/o/dashboard",
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
        title: "Commandes",
        url: "/o/orders",
        icon: HandPlatter,
      }
    ]
  },
  {
    id: "pos-system",
    title: "Système POS",
    url: null,
    icon: Store,
    subItems: [
      {
        id: "pos-sales-terminal",
        title: "Terminal de vente",
        url: "/o/pos/sales-terminal",
        icon: AppWindow,
        subItems: []
      },
      {
        id: "pos-orders",
        title: "Commandes",
        url: "/o/pos/orders",
        icon: HandPlatter,
      },
      {
        id: "pos-sales-history",
        title: "Historique des ventes",
        url: "/o/pos/sales-history",
        icon: ClipboardList,
        subItems: []
      },
      {
        id: "pos-stock",
        title: "Stock",
        url: "/o/pos/stock",
        icon: Package,
        subItems: []
      },
      {
        id: "pos-reports",
        title: "Rapports",
        url: "/o/pos/reports",
        icon: ChartColumnBig,
        subItems: []
      },
      {
        id: "pos-settings",
        title: "Paramètres POS",
        url: "/o/pos/settings",
        icon: UserRoundCog,
        subItems: []
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
        title: "Employés",
        url: "/o/users",
        icon: HardHat,
        subItems: []
      },
      {
        id: "roles",
        title: "Roles",
        url: "/o/roles",
        icon: Milestone,
        subItems: []
      },
      {
        id: "modules-permissions",
        title: "Modules & permi.",
        url: "/o/modules-permissions",
        icon: Package,
        subItems: []
      },
      {
        id: "back-office-manage",
        title: "Back office",
        url: "/o/back-office-manage",
        icon: Keyboard,
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

