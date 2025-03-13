export interface AssociatedElement {
  id: number | string;
  title: string;
  slug?: string;
  icon?: number | string;
  associatedElements?: AssociatedElement[];
  image?: string | null;
}

export interface RelationType {
  id?: number;
  parent?: number | string;
  title: string;
  slug?: string;
  multiple?: boolean;
  order?: number;
  feature?: string | boolean;
  closest?: AssociatedElement[];
  childs?: AssociatedElement[];
  metadata?: { style?: "xl" | "lg" | string };
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