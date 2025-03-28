export interface AssociatedElement {
  id: number;
  title: string;
  slug?: string;
  icon?: number | string;
  associatedElements?: AssociatedElement[];
  image?: string | null;
}

export interface RelationType {
  id?: number | string;
  parent?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  multiple?: boolean;
  order?: number;
  feature?: string | boolean;
  closest?: AssociatedElement[];
  childs?: AssociatedElement[];
  metadata?:{ style?: "xl" | "lg" | string; limitSelect?: any; };
  image?: string | null;
  icon?: number | string;
}

export interface GroupType {
  id: number; 
  name: string;
  description?: string;
  parent_id?: number;
  elements: AssociatedElement[];
  metadata?: { style?: "xl" | "lg" | string };
}