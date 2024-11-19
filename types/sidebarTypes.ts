export interface SubItem {
  title: string
  url: string
  icon?: React.ElementType
  permission?: string
}

export interface MenuItem {
  title: string
  url: string
  icon: React.ElementType
  subItems: SubItem[]
  permission?: string
}
