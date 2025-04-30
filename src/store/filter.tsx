import { create } from 'zustand';

export interface Group {
  id: number;
  name: string;
  description: string;
  active: number;
  segment?: boolean;
  elements: Element[];
  created_at: string;
  updated_at: string;
}

export interface Element {
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