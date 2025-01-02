export interface SubItem {
  id: string
  title: string
  url: string
  icon?: React.ElementType
  permission?: string
  subItems?: SubItem[]
}

export interface MenuItem {
  id: string
  title: string
  url: string | null
  icon?: React.ElementType
  subItems?: SubItem[]
  permission?: string
}
