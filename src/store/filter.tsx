import { create } from 'zustand';

export interface Group {
  id: number;
  name: string;
  description: string;
  parent_id: string;
  active: number;
  created_at: string;
  updated_at: string;
  elements: Element[];
}

export interface Element {
  id: number;
  name: string;
  icon: string;
  description: string;
  active: number;
  created_at: string;
  updated_at: string;
  laravel_through_key: number;
  checked: boolean; 
  descendents?: Element[]; 
}

interface GroupStore {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
}

export const useGroup = create<GroupStore>((set) => ({
  groups: [], 

  setGroups: (groups) =>
    set(() => ({
      groups,
    })),
}));