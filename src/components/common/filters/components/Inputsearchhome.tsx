// components/search/Inputsearchhome.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import type { SearchHeaderProps } from "./Search/types";

export default function Inputsearchhome({
  count,
  stick,
  filterAreaRef,
  busca,
  onOpenFilters,
  onSearch,
}: SearchHeaderProps) {
  const [value, setValue] = useState(busca ?? "");

  useEffect(() => {
    setValue(busca ?? "");
  }, [busca]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <section ref={filterAreaRef} className="w-full relative">
      <div className="h-[56px]" />
      <div className={`w-full z-[20] top-0 left-0 ${stick ? "fixed mt-[62px] md:mt-[70px]" : "absolute"}`}>
        <div className={`bg-cyan-500 ${stick ? "h-1/2" : "h-0"} w-full absolute top-0 left-0`} />
        <div className="container-medium">
          <form onSubmit={handleSubmit} className="flex border rounded-lg bg-white overflow-hidden relative">
            <div className="w-fit relative p-1">
              <Button
                type="button"
                onClick={onOpenFilters}
                className="font-normal py-2 px-3 md:pl-8 md:pr-7 h-full"
              >
                <span className="hidden md:block">Filtros</span>
                {!!count ? (
                  <div className="relative bg-zinc-950 -mr-1 rounded-full bg-yellow-300 p-[.55rem] text-[.55rem] font-bold">
                    <div className="text-white absolute h-[.65rem] top-50 left-50 -translate-x-1/2 -translate-y-1/2">
                      {count}
                    </div>
                  </div>
                ) : (
                  <Icon icon="fa-sliders-h" className="text-zinc-900 text-xl md:text-base" />
                )}
              </Button>
            </div>

            <input
              type="text"
              name="busca"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-4"
              placeholder="O que você precisa?"
            />

            <div className="p-1">
              <Button className="px-3 py-2 h-full" type="submit">
                <Icon icon="fa-search" type="far" className="md:text-lg rounded-none" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
