import { useEffect, useState } from "react";
import type { PanelMode } from "./PanelModeContext";

const DEFAULT_MODE: PanelMode = "simple";
const STORAGE_KEY = "painel_mode";

function normalizeMode(value: unknown): PanelMode {
  return value === "full" ? "full" : DEFAULT_MODE;
}

export default function usePainelPageMode() {
  const [panelMode, setPanelMode] = useState<PanelMode>(DEFAULT_MODE);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncMode = (value?: unknown) => {
      const nextValue = value ?? window.localStorage.getItem(STORAGE_KEY);
      setPanelMode(normalizeMode(nextValue));
    };

    syncMode();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) {
        syncMode(event.newValue);
      }
    };

    const handlePanelModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<PanelMode | undefined>;
      syncMode(customEvent.detail);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("painel-mode-change", handlePanelModeChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("painel-mode-change", handlePanelModeChange as EventListener);
    };
  }, []);

  return panelMode;
}
