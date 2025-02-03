export interface DataSeoType {
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
    site_text: string
    site_image: SiteImage
    site_description: string
    site_tags: string
    childs: any[]
}

export interface SiteImage {
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
