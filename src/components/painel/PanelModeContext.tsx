import { createContext, useContext } from "react";

export type PanelMode = "simple" | "full";

type PanelModeContextValue = {
  mode: PanelMode;
};

const PanelModeContext = createContext<PanelModeContextValue>({
  mode: "simple",
});

export function PanelModeProvider({
  mode,
  children,
}: {
  mode: PanelMode;
  children: React.ReactNode;
}) {
  return (
    <PanelModeContext.Provider value={{ mode }}>
      {children}
    </PanelModeContext.Provider>
  );
}

export function usePanelMode() {
  return useContext(PanelModeContext);
}
