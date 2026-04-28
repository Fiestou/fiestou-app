"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Label } from "../../ui/form";
import Img from "@/src/components/utils/ImgBase";
import Api from "@/src/services/api";
import { Categorie, Group } from "@/src/types/filtros";

const MAX = 3;

type Props = {
  value?: string[];                          // ids pré-selecionados
  onChange?: (id: number) => void;           // legado: emite só adição
  onToggle?: (id: number, selected: boolean) => void; // novo: add/remove
};

function PblalvoCreateProdutctBase({ onChange, onToggle, value }: Props) {
  const api = useMemo(() => new Api(), []);

  const [selectedElements, setSelectedElements] = useState<Categorie[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- helpers
  const toNum = (v: any) => Number(v);
  const normIds = (arr: any[]) =>
    (Array.isArray(arr) ? arr : [])
      .map(toNum)
      .filter((n) => Number.isFinite(n));

  // callbacks refs
  const onChangeRef = useRef<Props["onChange"]>(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const onToggleRef = useRef<Props["onToggle"]>(onToggle);
  useEffect(() => { onToggleRef.current = onToggle; }, [onToggle]);

  const selectedRef = useRef<Categorie[]>([]);
  useEffect(() => {
    selectedRef.current = selectedElements;
  }, [selectedElements]);

  // ===== 1) Carrega grupos (com name/icon)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const request: any = await api.request({ method: "get", url: "group/targetadcpbl" });
        if (!mounted) return;
        if (Array.isArray(request?.data)) {
          const groups: Group[] = request.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            categories: (g.categories || []).map((c: any) => ({
              id: toNum(c.id),
              name: c.name,
              icon: c.icon,
              element_related_id: c.element_related_id || [],
              group_id: g.id,
            })),
          }));
          setAllGroups(groups);
        }
      } catch (e) {
        console.error("Erro carregando targetadcpbl:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  // dicionário id->categoria
  const dict = useMemo(() => {
    const m = new Map<number, Categorie>();
    for (const g of allGroups) for (const c of g.categories) m.set(Number(c.id), c);
    return m;
  }, [allGroups]);

  //    (deixa PRÉ-SELECIONADO)
  useEffect(() => {
    const ids = (Array.isArray(value) ? value : [])
      .map(Number)
      .filter((n) => Number.isFinite(n) && dict.has(n)) // <<< usa dict.has
      .slice(0, MAX);

    const hydrated: Categorie[] = ids.map((id) => {
      const curr = selectedRef.current.find((e) => Number(e.id) === id);
      const meta = dict.get(id);
      return meta ? { ...curr, ...meta } : curr ?? ({ id } as Categorie);
    });

    const curr = selectedRef.current;
    const shouldUpdate =
      curr.length !== hydrated.length ||
      hydrated.some((e, i) => {
        const s = curr[i];
        return !s || s.id !== e.id || s.name !== e.name || s.icon !== e.icon;
      });

    if (shouldUpdate) setSelectedElements(hydrated);
  }, [value, dict]);

  // ===== 3) Emissão de add/remove para o pai
  const selectedIds = useMemo(
    () => selectedElements.map((el) => toNum(el.id)),
    [selectedElements]
  );

  // snapshot para detectar difs e emitir
  const prevIdsRef = useRef<number[]>([]);
  useEffect(() => {
    const prev = prevIdsRef.current;
    const curr = selectedIds;

    const prevSet = new Set(prev);
    const currSet = new Set(curr);

    const added = curr.filter((id) => !prevSet.has(id));
    const removed = prev.filter((id) => !currSet.has(id));

    if (added.length || removed.length) {
      if (onToggleRef.current) {
        for (const id of added) onToggleRef.current(id, true);
        for (const id of removed) onToggleRef.current(id, false);
      } else {
        for (const id of added) onChangeRef.current?.(id);
      }
    }
    prevIdsRef.current = curr;
  }, [selectedIds]);

  // ===== 4) Clique: toggle respeitando MAX
  const handleSelect = useCallback((element: Categorie) => {
    const id = toNum(element.id);
    setSelectedElements((prev) => {
      const exists = prev.some((el) => toNum(el.id) === id);
      if (exists) {
        return prev.filter((el) => toNum(el.id) !== id);
      }
      if (prev.length >= MAX) return prev;
      // pega meta completa do dict para manter name/icon
      const meta = dict.get(id) ?? element;
      return [...prev, { ...meta, id }];
    });
  }, [dict]);

  const atLimit = selectedElements.length >= MAX;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center">
          <Label>Público Alvo</Label>
          <div className="pl-2 pt-1 text-xs text-zinc-500">(máx {MAX})</div>
        </div>
        <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
          {selectedElements.length}/{MAX}
        </div>
      </div>

      <div className="space-y-3">
        {allGroups.map((group) => (
          <div key={group.id} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {group.name}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.categories.map((element) => {
                const id = toNum(element.id);
                const isChecked = selectedIds.includes(id);
                const isDisabled = atLimit && !isChecked;

                return (
                  <button
                    type="button"
                    key={id}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition
                      ${
                        isChecked
                          ? "border-amber-300 bg-amber-50 text-zinc-900 shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                      }
                      ${isDisabled ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    `}
                    onClick={() => handleSelect(element)}
                    title={element.name}
                  >
                    <div className="flex items-center gap-2">
                      {!!element.icon && (
                        <Img
                          src={element.icon}
                          className="h-5 w-5 object-contain"
                          alt={element.name}
                        />
                      )}
                      <div className="flex min-h-[20px] items-center whitespace-nowrap text-sm">
                        {element.name}
                      </div>
                      {isChecked && (
                        <input
                          type="checkbox"
                          defaultChecked
                          className="absolute opacity-0 -z-10"
                          readOnly
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PblalvoCreateProdutct = React.memo(PblalvoCreateProdutctBase);
export default PblalvoCreateProdutct;
