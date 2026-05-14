import { useState } from "react";
import { Terminal } from "@/components/Copilot/Terminal";
import { AgentView } from "@/components/Copilot/AgentView";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Github, Settings, Search, Command, BookOpen, Layers, TerminalSquare, ShieldAlert } from "lucide-react";
import { PremiumLogo } from "@/components/ui/PremiumLogo";
import { cn } from "@/lib/utils";

export function Workspace() {
  const [activeTab, setActiveTab] = useState<"terminal" | "agent">("terminal");

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-[#000000] text-zinc-300 font-sans overflow-hidden">
        
        {/* Header Navigation */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#000000] shrink-0">
          <div className="flex flex-row items-center gap-3">
            <PremiumLogo className="w-6 h-6" />
            <span className="font-semibold tracking-tight text-zinc-100 text-sm">Gemini Workspace</span>
            <span className="px-2 py-0.5 rounded bg-[#0a0a0a] border border-white/5 text-[10px] text-emerald-400 font-bold uppercase tracking-widest ml-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          
          <div className="flex flex-row items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-white/5 text-zinc-500 w-64 cursor-text transition-colors hover:border-white/10">
                <Search className="w-4 h-4" />
                <span className="text-xs">Search global context...</span>
                <div className="ml-auto flex items-center gap-1 opacity-50">
                   <Command className="w-3 h-3" />
                   <span className="text-[10px] font-mono">K</span>
                </div>
             </div>
             <Github className="w-5 h-5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
             <Settings className="w-5 h-5 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Sidebar - Context & Files */}
          <aside className="w-64 border-r border-white/5 bg-[#000000] flex flex-col py-6 px-4 shrink-0">
             <div className="space-y-6">
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                     <Layers className="w-3 h-3" /> Active Contexts
                   </h4>
                   <ul className="space-y-1">
                     {['GEMINI.md', 'package.json', 'src/App.tsx'].map((file, i) => (
                       <li key={i} className="flex items-center gap-2 text-xs text-zinc-300 hover:text-zinc-100 py-1.5 px-2 hover:bg-[#0a0a0a] rounded-md cursor-pointer transition-colors">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-mono tracking-tight">{file}</span>
                       </li>
                     ))}
                   </ul>
                </div>
                
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                     <ShieldAlert className="w-3 h-3" /> Global Policy
                   </h4>
                   <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-lg flex flex-col gap-2">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Sandbox</span>
                        <span className="text-emerald-400 font-bold">STRICT</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Auto-execute</span>
                        <span className="text-yellow-400 font-bold">PROMPT</span>
                     </div>
                   </div>
                </div>
             </div>
          </aside>

          {/* Center Main Area - Either Terminal or Agent depending on selection */}
          <main className="flex-1 flex flex-col bg-[#020202]">
            <div className="flex p-4">
               <div className="inline-flex bg-[#0a0a0a] border border-white/5 rounded-lg p-1 gap-1">
                  <button 
                    onClick={() => setActiveTab('terminal')}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'terminal' ? "bg-[#111111] text-zinc-100 border border-white/5 shadow-sm" : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <TerminalSquare className="w-3.5 h-3.5" />
                    CLI Bridge
                  </button>
                  <button 
                    onClick={() => setActiveTab('agent')}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === 'agent' ? "bg-[#111111] text-zinc-100 border border-white/5 shadow-sm" : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    System Agent
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-hidden relative m-4 mt-0 border border-white/5 rounded-xl bg-[#050505]">
                {activeTab === 'terminal' ? <Terminal /> : <AgentView />}
            </div>
          </main>

        </div>
      </div>
    </TooltipProvider>
  );
}
