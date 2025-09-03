import { create } from 'zustand';

export interface Group {
  id: number;
  name: string;
  description: string;
  active: number;
  created_at: string;
  updated_at: string;
  categories: categorie[];
}

export interface categorie {
  id: number
  name: string
  icon: string
  checked?: boolean
  description?: string
  active?: number
  created_at?: string
  updated_at?: string 
  group_id?: number,
  element_related_id?: number[]
}