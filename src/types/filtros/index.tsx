export interface RequestRegister {
  name: string;
  description: string;
  active: boolean;
  segment?: boolean;
}

export interface FilterQueryType {
  categories: number[];
  colors: string[];
  range: number;
  order: string;
}

export interface ResponseRegister {
  response: boolean;
  data: DataRegister;
}

export interface DataRegister {
  name: string;
  description: string;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface GroupsResponse {
  response: boolean;
  data: Group[];
}

export interface Group {
  id: number;
  name: string;
  description: string;
  target_adc?: boolean;
  active: number;
  created_at: string;
  updated_at: string;
  categories: Categorie[];
}

export interface Categorie {
  id: number;
  name: string;
  icon: string;
  title?: string;
  checked?: boolean;
  description?: string;
  groupName?: string;
  active?: number;
  created_at?: string;
  updated_at?: string;
  group_id?: number;
  element_related_id?: number[];
}

export interface RelatedElement {
  id: number;
  name: string;
  icon: string;
  groupName?: string;
}

export interface ElementsResponse {
  response: boolean;
  data: Categorie[];
}

export interface ElementResponse {
  response: boolean;
  data: Categorie;
}

export interface GenericResponse {
  response: boolean;
  data?: object;
  message?: string; // tinha escrito `nessage`
}
