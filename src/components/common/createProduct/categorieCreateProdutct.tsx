"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button, Label } from "../../ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import FilterTags from "./FilterTags";
import { Categorie, Group } from "@/src/types/filtros";
import Api from "@/src/services/api";
import Img from "@/src/components/utils/ImgBase";

type Props = {
  /** Aceita id vindo em qualquer formato “torto” (string, json quebrado, array misto, etc.) */
  value?: any;
  /** Usado quando há seleção pelo modal: emite a LISTA COMPLETA de ids */
  onChange?: (ids: number[]) => void;
  /** NOVO: usado ao clicar no X de um item: emite APENAS o id removido */
  onRemove?: (id: number) => void;
  max?: number;
  label?: string;
};

/** Normaliza QUALQUER entrada para um array de números (ids) único. */
function normalizeIds(input: any): number[] {
  if (input == null) return [];
  const arr: any[] = Array.isArray(input) ? input : [input];

  const text = arr
    .map((v) => {
      if (typeof v === "number") return String(v);
      if (typeof v === "string") return v;
      if (v && typeof v === "object") {
        const maybe = v.id ?? v.value ?? v.key ?? v.ID ?? v.Id;
        return maybe != null ? String(maybe) : JSON.stringify(v);
      }
      return "";
    })
    .join("|");

  const matches = text.match(/\d+/g) || [];
  const seen = new Set<number>();
  const out: number[] = [];
  for (const m of matches) {
    const n = Number(m);
    if (Number.isFinite(n) && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function CategorieCreateProdutct({
  value,
  onChange,
  onRemove,
  max = 6,
  label = "Categoria",
}: Props) {
  const [selectedElements, setSelectedElements] = useState<Categorie[]>([]);
  const [filterActive, setFilterActive] = useState(false);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const api = useMemo(() => new Api(), []);

  // ===== 1) Buscar grupos (nome/ícone) uma vez =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const request: any = await api.request({ method: "get", url: "group/list" });
        if (!mounted) return;
        if (Array.isArray(request?.data)) {
          const groups: Group[] = request.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            categories: (g.categories || []).map((c: any) => ({
              id: Number(c.id),
              name: c.name,
              icon: c.icon,
              element_related_id: c.element_related_id || [],
              group_id: g.id,
            })),
          }));
          setAllGroups(groups);
        }
      } catch (err) {
        console.error("Erro ao buscar group/list:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  const categoryDict = useMemo(() => {
    const map = new Map<number, Categorie>();
    for (const g of allGroups) for (const c of g.categories) map.set(Number(c.id), c);
    return map;
  }, [allGroups]);

  const selectedRef = useRef<Categorie[]>([]);
  useEffect(() => {
    selectedRef.current = selectedElements;
  }, [selectedElements]);

  // ===== 2) Hidratar a partir do value (NÃO emite onChange aqui para evitar loop) =====
  useEffect(() => {
    if (!categoryDict.size) return;
    const ids = normalizeIds(value).slice(0, max);
    const validIds = ids.filter((id) => categoryDict.has(id));

    const hydrated: Categorie[] = validIds.map((id) => {
      const curr = selectedRef.current.find((e) => Number(e.id) === id);
      const meta = categoryDict.get(id)!;
      return curr ? { ...curr, ...meta } : meta;
    });

    const curr = selectedRef.current;
    const shouldUpdate =
      curr.length !== hydrated.length ||
      hydrated.some((e, i) => {
        const s = curr[i];
        return !s || s.id !== e.id || s.name !== e.name || s.icon !== e.icon;
      });

    if (shouldUpdate) setSelectedElements(hydrated);
  }, [value, max, categoryDict]);

  const selectedIds = useMemo(
    () => selectedElements.map((e) => Number(e.id)).filter(Number.isFinite),
    [selectedElements]
  );

  // ===== Emissão da LISTA (apenas quando vem do modal de filtro) =====
  const emitListIfChanged = useCallback(
    (next: Categorie[]) => {
      const ids = next.map((e) => Number(e.id)).filter(Number.isFinite);
      const curr = selectedIds;
      const sameLen = ids.length === curr.length;
      const same = sameLen && ids.every((v, i) => v === curr[i]);
      if (!same) onChange?.(ids);
    },
    [onChange, selectedIds]
  );

  // ===== Remover UM item (apenas emite o ID clicado) =====
  const handleRemove = useCallback(
    (id: number) => {
      // 1) Atualiza visual local
      setSelectedElements((prev) => prev.filter((e) => Number(e.id) !== id));

      // 2) Notifica o pai APENAS com o id (sem lista)
      if (onRemove) {
        onRemove(id);
      } else {
        // fallback: se o pai ainda não usa onRemove, manda via onChange(id)
        // (quem recebe deve tratar como "remover id")
        (onChange as unknown as ((id: number) => void))?.(id);
      }
    },
    [onRemove, onChange]
  );

  // ===== Resultado do modal de filtro (emite lista completa) =====
  const handleFilter = useCallback(
    (elements: Categorie[]) => {
      const limited = elements.slice(0, max);
      const curr = selectedRef.current;
      const shouldUpdate =
        curr.length !== limited.length ||
        limited.some((e, i) => {
          const s = curr[i];
          return !s || s.id !== e.id || s.name !== e.name || s.icon !== e.icon;
        });

      if (shouldUpdate) {
        setSelectedElements(limited);
        emitListIfChanged(limited); // aqui sim mandamos a LISTA
      }
      setFilterActive(false);
    },
    [emitListIfChanged, max]
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center">
          <Label>{label}</Label>
          <div className="pl-2 pt-1 text-xs text-zinc-500">
            (máx {max} categorias)
          </div>
        </div>
        <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
          {selectedElements.length}/{max}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3">
        <div className="min-h-[72px]">
          {selectedElements.length ? (
            <div className="flex flex-wrap gap-2">
              {selectedElements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2"
                >
                  {item.icon && (
                    <Img
                      src={String(item.icon)}
                      className="h-5 w-5 object-contain"
                      alt={String(item.name ?? item.id)}
                    />
                  )}
                  <span className="text-sm leading-snug text-zinc-700">
                    {item.name ?? item.title ?? item.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(Number(item.id))}
                    className="rounded-md p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                    aria-label={`Remover ${item.name ?? item.title ?? item.id}`}
                    title="Remover"
                  >
                    <Icon icon="fa-times" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-4 text-sm text-zinc-400">
              Selecione a categoria
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-zinc-100 pt-3">
          <Button
            type="button"
            style="btn-link"
            className="w-full justify-center px-4 sm:w-auto"
            onClick={() => setFilterActive(true)}
          >
            Selecionar categorias
          </Button>
        </div>
      </div>

      <FilterTags
        groups={allGroups}
        status={filterActive}
        maxSelected={max}
        onClose={() => setFilterActive(false)}
        clickedElements={selectedElements}
        onFilter={handleFilter}
      />
    </div>
  );
}

export default React.memo(CategorieCreateProdutct);
