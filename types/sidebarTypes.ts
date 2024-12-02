export interface SubItem {
  id:string
  title: string
  url: string
  icon?: React.ElementType | null
  permission?: string
  subItems?:[]
}

export interface MenuItem {
  id: string
  title: string
  url: string | null
  icon?: React.ElementType | null
  subItems: SubItem[]
  permission?: string
}
