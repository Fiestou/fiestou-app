export interface ScriptsType {
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
    script_list: ScriptList[]
    header_script_scripts: HeaderScriptScript[]
    lgpd_text: string
    lgpd_description: string
    childs: any[]
  }
  
  export interface ScriptList {
    id: string
    script_position: string
    script_description: string
    script_title: string
    script_text: string
  }
  
  export interface HeaderScriptScript {
    id: string
    header_script_code: string
    header_script_title: string
    header_script_description?: string
  }
  