import * as React from "react";
import { useState, useEffect } from "react";
import { Terminal } from "@/components/Copilot/Terminal";
import { AgentView } from "@/components/Copilot/AgentView";
import { DeviceInfo } from "@/components/Copilot/DeviceInfo";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  MagnifyingGlassIcon, 
  ViewVerticalIcon, 
  ViewHorizontalIcon,
  PlusIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ColorWheelIcon,
  TrashIcon,
  GearIcon,
  Cross2Icon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  LayersIcon,
  RocketIcon,
  ClipboardIcon,
  UpdateIcon,
  PieChartIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  LaptopIcon,
  ShadowIcon
} from "@radix-ui/react-icons";
import { SettingsModal } from "@/components/Copilot/SettingsModal";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

const THEMES = [
  { id: 'liquid', name: 'Liquid Glass', icon: ShadowIcon, class: 'theme-liquid' },
  { id: 'dark-default', name: 'Midnight', icon: MoonIcon, class: 'theme-midnight' },
  { id: 'light', name: 'Clean Light', icon: SunIcon, class: 'theme-light' },
  { id: 'futuristic', name: 'Neon Cyber', icon: MagicWandIcon, class: 'theme-futuristic' },
  { id: 'win11-dark', name: 'Win 11 Dark', icon: LaptopIcon, class: 'theme-win-dark' },
  { id: 'hacker', name: 'Terminal', icon: RocketIcon, class: 'theme-hacker' }
];

export function Workspace() {
  const [showAppearance, setShowAppearance] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES[5]); // Default to Hacker (Terminal Green)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false); // Default hide on mobile
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [isPlanMode, setIsPlanMode] = useState(false);
  const [activeView, setActiveView] = useState<'terminal' | 'system'>('terminal');


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
              {leftSidebarOpen ? <DoubleArrowLeftIcon className="w-5 h-5" /> : <DoubleArrowRightIcon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted py-1.5 px-3 -ml-3 rounded-lg transition-colors">
              <span className="font-semibold tracking-tight text-foreground text-sm flex items-center gap-2">
                Gemini <span className="hidden sm:inline">Workspace</span> <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </div>
          </div>
          
          <div className="flex flex-row items-center gap-2 sm:gap-3 relative">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground w-64 cursor-text transition-colors hover:border-foreground/20 mr-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="text-xs">Search chats...</span>
                <div className="ml-auto flex items-center gap-1 opacity-50">
                   <span className="text-[10px] font-mono">⌘</span>
                   <span className="text-[10px] font-mono">K</span>
                </div>
             </div>
             
              <Popover open={showAppearance} onOpenChange={setShowAppearance}>
                 <PopoverTrigger asChild>
                   <button 
                      title="Appearance"
                      className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        showAppearance ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                   >
                     <activeTheme.icon className="w-5 h-5" />
                   </button>
                 </PopoverTrigger>
                 <PopoverContent className="w-56 p-2 animate-radix-popover border-border bg-card shadow-2xl rounded-xl" align="end">
                   <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-border/50 mb-2">
                     Environment Theme
                   </div>
                   <div className="grid grid-cols-1 gap-1">
                     {THEMES.map(theme => (
                       <button
                         key={theme.id}
                         onClick={() => {
                           setActiveTheme(theme);
                           setShowAppearance(false);
                         }}
                         className={cn(
                           "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all group",
                           activeTheme.id === theme.id 
                             ? "bg-primary/10 text-primary" 
                             : "text-foreground hover:bg-muted"
                         )}
                       >
                         <div className="flex items-center gap-3">
                           <theme.icon className={cn(
                             "w-4 h-4 transition-transform group-hover:scale-110",
                             activeTheme.id === theme.id ? "text-primary" : "text-muted-foreground"
                           )} />
                           <span className="font-semibold">{theme.name}</span>
                         </div>
                         {activeTheme.id === theme.id && <CheckIcon className="w-4 h-4 text-primary animate-in fade-in zoom-in duration-300" />}
                       </button>
                     ))}
                   </div>
                 </PopoverContent>
               </Popover>

              <button 
                 title="Windows 11 Agent"
                 onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                 className={cn(
                   "p-2 rounded-lg transition-colors md:hidden",
                   rightSidebarOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                 )}
              >
                <LayersIcon className="w-5 h-5" />
              </button>

              <button onClick={() => setSettingsOpen(true)} className="relative p-2 flex-shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <GearIcon className="w-5 h-5" />
              </button>

          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar - Chat History */}
          <aside className={cn(
            "absolute md:relative z-20 h-full w-[260px] border-r border-border bg-background flex flex-col py-4 px-3 shrink-0 transition-all duration-300 transform animate-radix-sidebar",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden md:w-0 md:-translate-x-full md:p-0 md:border-none"
          )}>
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <span className="font-bold tracking-tight text-foreground text-sm">Menu</span>
                  <button onClick={() => setLeftSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <Cross2Icon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-4">
                  <div className="space-y-1 px-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2 opacity-50">
                      Orchestration
                    </h4>
                    
                    {/* Agent Button with Sub-functions */}
                    <div className="space-y-1 mb-6">
                      <button 
                        onClick={() => {
                          setActiveView('terminal');
                          setPendingCommand("gemini --help");
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full py-2.5 px-3 rounded-lg transition-all border border-transparent group",
                          activeView === 'terminal' ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                        )}
                      >
                        <RocketIcon className={cn("w-4 h-4", activeView === 'terminal' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        <span className="text-sm font-semibold">Agent</span>
                      </button>
                      <div className="pl-9 space-y-1 border-l border-border ml-5 mt-1">
                        <button 
                          onClick={() => setPendingCommand('netsh interface set interface name="Wi-Fi" admin=disabled')}
                          className="text-[11px] text-muted-foreground hover:text-red-400 block py-1 transition-colors"
                        >
                          • Disable WiFi
                        </button>
                        <button 
                          onClick={() => setPendingCommand('netsh interface set interface name="Wi-Fi" admin=enabled')}
                          className="text-[11px] text-muted-foreground hover:text-emerald-400 block py-1 transition-colors"
                        >
                          • Enable WiFi
                        </button>
                        <button 
                          onClick={() => setPendingCommand("cmd /c dir")}
                          className="text-[11px] text-muted-foreground hover:text-foreground block py-1 transition-colors"
                        >
                          • Run System CMD
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setPendingCommand("gemini list-tasks")}
                      className="flex items-center gap-3 w-full text-foreground hover:bg-muted py-2.5 px-3 rounded-lg transition-all border border-transparent group"
                    >
                      <ClipboardIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-sm font-medium">Task</span>
                    </button>

                    <button 
                      onClick={() => setPendingCommand("gemini routines")}
                      className="flex items-center gap-3 w-full text-foreground hover:bg-muted py-2.5 px-3 rounded-lg transition-all border border-transparent group"
                    >
                      <UpdateIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                      <span className="text-sm font-medium">Routine</span>
                    </button>

                    <button 
                      onClick={() => setActiveView('system')}
                      className={cn(
                        "flex items-center gap-3 w-full py-2.5 px-3 rounded-lg transition-all border border-transparent group",
                        activeView === 'system' ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      )}
                    >
                      <PieChartIcon className={cn("w-4 h-4", activeView === 'system' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="text-sm font-medium">Analysis & System</span>
                    </button>
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
            {activeView === 'terminal' ? (
              <Terminal 
                 key={chatSessionId} 
                 externalCommand={pendingCommand}
                 onExternalCommandExecuted={() => setPendingCommand(null)}
                 isPlanMode={isPlanMode}
              />
            ) : (
              <DeviceInfo />
            )}
          </main>

          {/* Right Sidebar - Windows 11 Agent / Context */}
          {rightSidebarOpen && (
            <aside className="absolute inset-y-0 right-0 z-20 w-[320px] lg:relative lg:z-auto lg:w-[380px] border-l border-border bg-card flex flex-col shrink-0 shadow-2xl transition-all duration-300 min-h-0 overflow-hidden">
              <AgentView 
                onExecuteCommand={setPendingCommand} 
                isPlanMode={isPlanMode}
                setIsPlanMode={setIsPlanMode}
              />
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

