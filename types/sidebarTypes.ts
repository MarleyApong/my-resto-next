export interface SubItem {
  title: string
  url: string
  icon?: React.ElementType
  permission?: string
  subItems?:[]
}

export interface MenuItem {
  title: string
  url: string | null
  icon: React.ElementType
  subItems: SubItem[]
  permission?: string
}
