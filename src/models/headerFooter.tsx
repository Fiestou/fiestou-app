export interface HeaderFooterType {
    id: number
    user_id: number
    parent_id: any
    title: string
    slug: string
    details: any
    featured: any
    views: any
    trash: number
    order: any
    type: string
    status: number
    created_at: string
    updated_at: string
    publicUrl: any
    menu_links: MenuLink[]
    header_logo: HeaderLogo
    dropdown_links: DropdownLink[]
    footer_logo: FooterLogo
    footer_text: string
    column_links: ColumnLink[]
    social: Social[]
    header_icon: HeaderIcon
    header_shortcut: HeaderShortcut
    childs: any[]
  }
  
  export interface MenuLink {
    id: string
    menu_link: string
    menu_title: string
    menu_icon: string
  }
  
  export interface HeaderLogo {
    medias: Media[]
  }
  
  export interface Media {
    id: number
    user_id: number
    application_id: number
    title: string
    slug: string
    description: string
    file_name: string
    path: string
    base_url: string
    permanent_url: string
    extension: string
    details: Details
    permissions: string
    type: string
    created_at: string
    updated_at: string
    file_size: number
  }
  
  export interface Details {
    sizes: Sizes
  }
  
  export interface Sizes {
    default: string
    thumb: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  
  export interface DropdownLink {
    id: string
    dropdown_title: string
    dropdown_link: string
  }
  
  export interface FooterLogo {
    medias: Media2[]
  }
  
  export interface Media2 {
    id: number
    user_id: number
    application_id: number
    title: string
    slug: string
    description: string
    file_name: string
    path: string
    base_url: string
    permanent_url: string
    extension: string
    details: Details2
    permissions: string
    type: string
    created_at: string
    updated_at: string
    file_size: number
  }
  
  export interface Details2 {
    sizes: Sizes2
  }
  
  export interface Sizes2 {
    default: string
    thumb: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  
  export interface ColumnLink {
    id: string
    column_list_links: ColumnListLink[]
    column_title: string
  }
  
  export interface ColumnListLink {
    id: string
    column_list_title: string
    column_list_link: string
  }
  
  export interface Social {
    id: string
    social_title: string
    social_link: string
  }
  
  export interface HeaderIcon {
    medias: Media3[]
  }
  
  export interface Media3 {
    id: number
    user_id: number
    application_id: number
    title: string
    slug: string
    description: string
    file_name: string
    path: string
    base_url: string
    permanent_url: string
    extension: string
    details: Details3
    permissions: string
    type: string
    created_at: string
    updated_at: string
    file_size: number
  }
  
  export interface Details3 {
    sizes: Sizes3
  }
  
  export interface Sizes3 {
    default: string
    thumb: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  
  export interface HeaderShortcut {
    medias: Media4[]
  }
  
  export interface Media4 {
    id: number
    user_id: number
    application_id: number
    title: string
    slug: string
    description: string
    file_name: string
    path: string
    base_url: string
    permanent_url: string
    extension: string
    details: Details4
    permissions: string
    type: string
    created_at: string
    updated_at: string
    file_size: number
  }
  
  export interface Details4 {
    sizes: Sizes4
  }
  
  export interface Sizes4 {
    default: string
    thumb: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  