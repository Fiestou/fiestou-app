export interface RelationType {
  id?: any;
  parent?: number | string;
  title: string;
  slug?: string;
  multiple?: boolean;
  order?: number;
  feature?: string | boolean;
  closest?: Array<any>;
  childs?: Array<any>;
  metadata?: any;
  image?: any;
}
