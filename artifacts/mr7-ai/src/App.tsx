import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ChatView } from "./components/ChatView";
import { PricingView } from "./components/PricingView";
import { StoreProvider, useStore } from "./lib/store";
import { ApiAccessModal } from "./components/modals/ApiAccessModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { AccountModal } from "./components/modals/AccountModal";
import { ToolModal } from "./components/modals/ToolModal";
import { UtilityToolModal, type UtilityTool } from "./components/modals/UtilityToolModal";
import { ToolsHubModal } from "./components/modals/ToolsHubModal";
import { ShortcutsModal } from "./components/modals/ShortcutsModal";
import { CommandPalette } from "./components/CommandPalette";
import { MemoryModal } from "./components/modals/MemoryModal";
import { BookmarksModal } from "./components/modals/BookmarksModal";
import { SearchModal } from "./components/modals/SearchModal";
import { CompareView } from "./components/CompareView";
import { FloatingActionDock } from "./components/FloatingActionDock";
import { PersonaEditorModal } from "./components/modals/PersonaEditorModal";
import { LocalModelModal } from "./components/modals/LocalModelModal";
import { OsintDashboard } from "./components/modals/OsintDashboard";

const queryClient = new QueryClient();

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

function AppContent() {
  const { dispatch } = useStore();
  const { toast } = useToast();
  const { t } = useT();
  const konamiRef = useRef<string[]>([]);
  const [godMode, setGodMode] = useState(false);

  useEffect(() => {
    function onKonami(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inField = ["INPUT", "TEXTAREA"].includes(target?.tagName) || target?.isContentEditable;
      if (inField) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konamiRef.current = [...konamiRef.current, k].slice(-KONAMI.length);
      if (KONAMI.every((kk, i) => konamiRef.current[i] === kk)) {
        konamiRef.current = [];
        setGodMode(true);
        toast({ description: t("toast.godmodeUnlocked") });
        setTimeout(() => setGodMode(false), 4500);
      }
    }
    document.addEventListener("keydown", onKonami);
    return () => document.removeEventListener("keydown", onKonami);
  }, [toast, t]);
  const [personaEditorOpen, setPersonaEditorOpen] = useState(false);
  const [localModelOpen, setLocalModelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toolsHubOpen, setToolsHubOpen] = useState(false);
  const [utility, setUtility] = useState<UtilityTool | null>(null);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [osintDashOpen, setOsintDashOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inField = ["INPUT", "TEXTAREA"].includes(target?.tagName) || target?.isContentEditable;
      if (!inField && e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
      }
      if (!inField && (e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        dispatch({ type: "NEW_CHAT" });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (!inField && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setToolsHubOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (!inField && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setMemoryOpen((v) => !v);
      }
      if (!inField && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setBookmarksOpen((v) => !v);
      }
      if (!inField && (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setCompareOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dispatch]);

  function handlePaletteAction(action: string, payload?: string) {
    setPaletteOpen(false);
    switch (action) {
      case "new-chat":
        dispatch({ type: "NEW_CHAT" });
        break;
      case "open-pricing":
        setPricingOpen(true);
        break;
      case "open-api":
        setApiOpen(true);
        break;
      case "open-settings":
        setSettingsOpen(true);
        break;
      case "open-shortcuts":
        setShortcutsOpen(true);
        break;
      case "set-model":
        if (payload) dispatch({ type: "SET_MODEL", model: payload });
        break;
      case "set-persona":
        dispatch({ type: "SET_PERSONA", persona: payload || null });
        break;
      case "open-tools":
        setToolsHubOpen(true);
        break;
      case "select-chat":
        if (payload) dispatch({ type: "SELECT_CHAT", id: payload });
        break;
    }
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden text-foreground selection:bg-primary/30 dark">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenPricing={() => setPricingOpen(true)}
        onOpenApi={() => setApiOpen(true)}
        onOpenTool={() => setToolOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenUtility={(name) => setUtility(name)}
        onOpenToolsHub={() => setToolsHubOpen(true)}
        onOpenMemory={() => setMemoryOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCompare={() => setCompareOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onOpenPricing={() => setPricingOpen(true)}
          onOpenToolsHub={() => setToolsHubOpen(true)}
          onOpenHelp={() => setShortcutsOpen(true)}
          onOpenPersonaEditor={() => setPersonaEditorOpen(true)}
          onOpenLocalModel={() => setLocalModelOpen(true)}
        />
        <ChatView onOpenOsintDash={() => setOsintDashOpen(true)} />
        {compareOpen && <CompareView onClose={() => setCompareOpen(false)} />}
      </main>

      <FloatingActionDock
        onNewChat={() => dispatch({ type: "NEW_CHAT" })}
        onSearch={() => setSearchOpen(true)}
        onMemory={() => setMemoryOpen(true)}
        onBookmarks={() => setBookmarksOpen(true)}
        onCompare={() => setCompareOpen(true)}
        onTools={() => setToolsHubOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onHelp={() => setShortcutsOpen(true)}
      />

      {pricingOpen && <PricingView onClose={() => setPricingOpen(false)} />}
      <ApiAccessModal open={apiOpen} onOpenChange={setApiOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} onUpgrade={() => { setAccountOpen(false); setPricingOpen(true); }} />
      <ToolModal open={toolOpen} onOpenChange={setToolOpen} />
      <UtilityToolModal tool={utility} onOpenChange={(v) => { if (!v) setUtility(null); }} />
      <ToolsHubModal open={toolsHubOpen} onOpenChange={setToolsHubOpen} onSelect={(t) => setUtility(t)} />
      <ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onAction={handlePaletteAction} />
      <MemoryModal open={memoryOpen} onOpenChange={setMemoryOpen} />
      <BookmarksModal open={bookmarksOpen} onOpenChange={setBookmarksOpen} />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <PersonaEditorModal open={personaEditorOpen} onOpenChange={setPersonaEditorOpen} />
      <LocalModelModal open={localModelOpen} onOpenChange={setLocalModelOpen} />
      <OsintDashboard open={osintDashOpen} onOpenChange={setOsintDashOpen} />

      {godMode && (
        <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/10 animate-pulse" />
          <div className="relative bg-card/90 backdrop-blur-md border-2 border-primary rounded-3xl px-8 py-6 shadow-[0_0_60px_rgba(226,18,39,0.5)] text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary/80 mb-2">↑↑↓↓←→←→ B A</div>
            <div className="text-3xl font-black bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">GODMODE UNLOCKED</div>
            <div className="text-[12px] text-muted-foreground mt-2">Multi-strategy parallel race available · select Godmode pill in chat</div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
