import { useState, useEffect } from "react";
import { Terminal } from "@/components/Copilot/Terminal";
import { AgentView } from "@/components/Copilot/AgentView";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, Command, Layers, Plus, MessageSquare, PanelLeft, PanelLeftClose, ChevronDown, Palette, Trash2, Settings, X } from "lucide-react";
import { SettingsModal } from "@/components/Copilot/SettingsModal";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: 'liquid', name: 'Liquid Glass (iOS)', class: 'theme-liquid' },
  { id: 'dark-default', name: 'Midnight (Default)', class: 'theme-midnight' },
  { id: 'light', name: 'Clean (Light)', class: 'theme-light' },
  { id: 'futuristic', name: 'Neon Cyber (Futuristic)', class: 'theme-futuristic' },
  { id: 'win11-dark', name: 'Windows 11 Dark', class: 'theme-win-dark' },
  { id: 'hacker', name: 'Terminal Green', class: 'theme-hacker' }
];

export function Workspace() {
  const [showAppearance, setShowAppearance] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]); // Default to liquid
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false); // Default hide on mobile
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);

  // Chat memory for sidebar
  const [chats, setChats] = useState([
    { id: 1, title: 'Configure Enterprise Proxy' },
    { id: 2, title: 'Debug CLI Auth Flow' }
  ]);

  // Open sidebar automatically on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setLeftSidebarOpen(true);
      } else {
        setLeftSidebarOpen(false);
      }
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Remove all theme classes and apply the new one
    document.body.classList.remove(...THEMES.map(t => t.class));
    document.body.classList.add(activeTheme.class);
  }, [activeTheme]);

  const handleNewChat = () => {
    setChatSessionId(prev => prev + 1);
    if (window.innerWidth < 768) {
      setLeftSidebarOpen(false); // Close on mobile
    }
  };

  const deleteChat = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(chats.filter(c => c.id !== id));
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-screen w-full bg-background text-foreground font-sans overflow-hidden transition-colors duration-300", activeTheme.class)}>
        
        {/* Top Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background shrink-0 z-30">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-2"
            >
              {leftSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted py-1.5 px-3 -ml-3 rounded-lg transition-colors">
              <span className="font-semibold tracking-tight text-foreground text-sm flex items-center gap-2">
                Gemini <span className="hidden sm:inline">Workspace</span> <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </div>
          </div>
          
          <div className="flex flex-row items-center gap-2 sm:gap-3 relative">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground w-64 cursor-text transition-colors hover:border-foreground/20 mr-2">
                <Search className="w-4 h-4" />
                <span className="text-xs">Search chats...</span>
                <div className="ml-auto flex items-center gap-1 opacity-50">
                   <Command className="w-3 h-3" />
                   <span className="text-[10px] font-mono">K</span>
                </div>
             </div>
             
             <button 
                title="Appearance"
                onClick={() => setShowAppearance(!showAppearance)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showAppearance ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
             >
               <Palette className="w-5 h-5" />
             </button>

             <button 
                title="Windows 11 Agent"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className={cn(
                  "p-2 rounded-lg transition-colors md:hidden",
                  rightSidebarOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
             >
               <Layers className="w-5 h-5" />
             </button>

             <button onClick={() => setSettingsOpen(true)} className="relative p-2 flex-shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
               <Settings className="w-5 h-5" />
             </button>

             {/* Theme Settings Dropdown */}
             {showAppearance && (
               <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                 <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border mb-2">
                   Appearance
                 </div>
                 <div className="space-y-1">
                   {THEMES.map(theme => (
                     <button
                       key={theme.id}
                       onClick={() => {
                         setActiveTheme(theme);
                         setShowAppearance(false);
                       }}
                       className="w-full flex items-center justify-between px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                     >
                       <span className="font-medium">{theme.name}</span>
                       {activeTheme.id === theme.id && <span className="text-emerald-400 font-bold ml-2">✓</span>}
                     </button>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar - Chat History */}
          <aside className={cn(
            "absolute md:relative z-20 h-full w-[260px] border-r border-border bg-background flex flex-col py-4 px-3 shrink-0 transition-all duration-300 transform",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden md:w-0 md:-translate-x-full md:p-0 md:border-none"
          )}>
               <div className="flex items-center justify-between mb-6 md:hidden">
                 <span className="font-bold tracking-tight text-foreground text-sm">Chats</span>
                 <button onClick={() => setLeftSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <button 
                 onClick={handleNewChat}
                 className="flex items-center gap-2 w-full bg-card hover:bg-muted text-foreground border border-border rounded-lg px-3 py-2.5 transition-colors shadow-sm mb-6"
               >
                 <Plus className="w-4 h-4" />
                 <span className="text-sm font-medium">New chat</span>
               </button>

               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div className="space-y-6">
                    <div>
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                         Today
                       </h4>
                       <ul className="space-y-1">
                         {chats.map((chat) => (
                           <li key={chat.id} className="flex items-center justify-between gap-2 text-sm text-foreground py-2 px-2 bg-muted/50 rounded-lg cursor-pointer transition-colors border border-transparent shadow-sm group">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">{chat.title}</span>
                              </div>
                              <button 
                                onClick={(e) => deleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted-foreground/20 rounded-md text-muted-foreground hover:text-red-400 transition-all shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </li>
                         ))}
                       </ul>
                    </div>

                    <div>
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                         Previous 7 Days
                       </h4>
                       <ul className="space-y-1">
                         {['MCP Server setup for Windows', 'Fix docker sandboxing error', 'Write tests for shell tool'].map((chatTitle, i) => (
                           <li key={i} className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground py-2 px-2 hover:bg-muted rounded-lg cursor-pointer transition-colors border border-transparent group">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{chatTitle}</span>
                              </div>
                              <button 
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-red-400 transition-all shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </li>
                         ))}
                       </ul>
                    </div>
                 </div>
               </div>
          </aside>

          {/* Underlay for Left Sidebar on Mobile */}
          {leftSidebarOpen && (
            <div 
              className="md:hidden absolute inset-0 bg-background/50 backdrop-blur-sm z-10"
              onClick={() => setLeftSidebarOpen(false)}
            />
          )}

          {/* Center Main Chat Area */}
          <main className="flex-1 flex flex-col bg-background relative max-w-full min-w-0 h-full">
            <Terminal key={chatSessionId} />
          </main>

          {/* Right Sidebar - Windows 11 Agent / Context */}
          {rightSidebarOpen && (
            <aside className="absolute inset-y-0 right-0 z-20 w-[320px] lg:relative lg:z-auto lg:w-[380px] border-l border-border bg-card flex flex-col shrink-0 shadow-2xl transition-all duration-300">
              <AgentView />
            </aside>
          )}

           {/* Underlay for Right Sidebar on Mobile */}
           {rightSidebarOpen && (
            <div 
               className="lg:hidden absolute inset-0 bg-background/50 backdrop-blur-sm z-10"
               onClick={() => setRightSidebarOpen(false)}
            />
          )}

        </div>
      </div>
      
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </TooltipProvider>
  );
}
