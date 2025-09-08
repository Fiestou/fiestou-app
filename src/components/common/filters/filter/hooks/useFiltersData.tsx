// hooks/useFiltersData.ts
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { GroupsResponse, Categorie } from "@/src/types/filtros";
import { StoreType } from "@/src/models/store";

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

export function useFiltersData(open: boolean, store?: StoreType) {
  const [loading, setLoading] = useState(false);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [pblcAlvo, setPblcAlvo] = useState<Group[]>([]);

  useEffect(() => {
    if (!open) return;
    const api = new Api();
    setLoading(true);

    const requests = [
      store
        ? api.request<GroupsResponse>({
            method: "get",
            url: "group/listgroupstore",
            data: { store_id: store.id },
          })
        : api.request<GroupsResponse>({
            method: "get",
            url: "group/list",
          }),

      api.request<GroupsResponse>({ method: "get", url: "group/targetadcpbl" }),
    ];

    Promise.all(requests)
      .then(([g, p]) => {
        if (g?.data) setAllGroups(g.data as unknown as Group[]);
        if (p?.data) setPblcAlvo(p.data as unknown as Group[]);
      })
      .finally(() => setLoading(false));
  }, [open, store]);

  return { loading, allGroups, pblcAlvo };
}
