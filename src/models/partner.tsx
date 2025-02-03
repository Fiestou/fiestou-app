export interface PartnerType {
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
    publicUrl: string
    main_text: string
    main_description: string
    main_icons: MainIcons
    childs: any[]
}

export interface MainIcons {
    medias: any
}