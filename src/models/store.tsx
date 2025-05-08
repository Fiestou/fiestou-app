export interface StoreType {
  id: number
  user: number
  title: string
  slug: string
  companyName: string
  deliveryRegions: any[]
  document: any
  description: string
  cover: Cover
  profile: Profile
  segment: string
  hasDelivery: any
  metadata: any
  openClose: DayType[]
  zipCode: string
  street: string
  number: string
  neighborhood: string
  complement: any
  city: string
  state: string
  country: string
  status: number
  created_at: string
  updated_at: string
}

export interface Cover {
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

export interface Profile {
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

export interface DayType {
  open: string
  day: string
  close: string
  working: string
}
