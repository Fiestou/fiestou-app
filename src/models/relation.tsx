export interface RelationType {
  id?: any;
  parent?: number | string;
  title: string;
  slug?: string;
  multiple?: boolean;
  feature?: string | boolean;
  closest?: Array<any>;
  childs?: Array<any>;
  metadata?: any;
  image?: any;
}
