import { useEffect, useState } from "react";
import { getUser } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import { getFirstName } from "@/src/helper";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { User } from "lucide-react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import SimplePanelNav from "./SimplePanelNav";
import { PanelModeProvider } from "./PanelModeContext";

const HEADER_H = "h-12";
const HEADER_H_PX = "48px";

function GlobalHeader({ user }: { user: UserType }) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-[60] bg-zinc-900 ${HEADER_H}`}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-20">
            <Img
              src="/images/logo.png"
              size="md"
              className="w-full h-auto object-contain"
            />
          </div>
        </Link>

        <Link href="/painel" className="flex items-center gap-3 text-white hover:text-yellow-300 transition-colors">
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-base font-semibold font-display whitespace-nowrap">
              Ola, {getFirstName(user.name || "")}
            </div>
            <div className="text-sm text-zinc-300 whitespace-nowrap">Meu painel</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center border border-zinc-600">
            <User size={18} className="text-yellow-300" />
          </div>
        </Link>
      </div>
    </header>
  );
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType>({} as UserType);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"simple" | "full">("simple");

  useEffect(() => {
    setUser(getUser());

    const saved = localStorage.getItem("painel_sidebar");
    if (saved === "collapsed") setSidebarCollapsed(true);

    const savedMode = localStorage.getItem("painel_mode");
    if (savedMode === "full" || savedMode === "simple") {
      setPanelMode(savedMode);
    }
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("painel_sidebar", next ? "collapsed" : "expanded");
  };

  const togglePanelMode = () => {
    const next = panelMode === "simple" ? "full" : "simple";
    setPanelMode(next);
    localStorage.setItem("painel_mode", next);
    window.dispatchEvent(new CustomEvent("painel-mode-change", { detail: next }));
    if (next === "simple") {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <GlobalHeader user={user} />

      <div style={{ paddingTop: HEADER_H_PX }}>
        {panelMode === "full" && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />
        )}

        <div
          className={`transition-all duration-300 ${
            panelMode === "full"
              ? sidebarCollapsed
                ? "lg:ml-[72px]"
                : "lg:ml-[260px]"
              : "lg:ml-0"
          }`}
        >
          <PanelModeProvider mode={panelMode}>
            <TopBar
              user={user}
              panelMode={panelMode}
              onTogglePanelMode={togglePanelMode}
              onMenuClick={() => setMobileMenuOpen(true)}
            />

            <main className="p-3 sm:p-4 lg:p-8">
              {panelMode === "simple" && <SimplePanelNav />}
              {children}
            </main>
          </PanelModeProvider>
        </div>
      </div>
    </div>
  );
}
