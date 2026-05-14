import { Terminal } from "@/components/Copilot/Terminal";
import { AgentView } from "@/components/Copilot/AgentView";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Github, 
  MessageSquare, 
  Settings, 
  Layers, 
  FileText, 
  Activity,
  Database,
  Globe,
  Cpu,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "agent">("chat");

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
        {/* Header Navigation */}
        <nav className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xs uppercase">GC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight tracking-tight">Gemini Copilot</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">v1.2.0 • Gemini 3 Flash</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-medium text-emerald-400">Gemini CLI Active</span>
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </nav>

        <main className="flex-1 flex overflow-hidden">
          {/* Sidebar Activity */}
          <aside className="w-16 border-r border-zinc-800 flex flex-col items-center py-6 gap-6 bg-zinc-950/80 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab("chat")}
              className={cn(
                "p-2.5 rounded-xl transition-all hover:scale-110 cursor-pointer border",
                activeTab === "chat" 
                  ? "text-indigo-400 bg-indigo-500/20 border-indigo-500/30" 
                  : "text-zinc-500 border-transparent hover:text-zinc-100"
              )}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab("agent")}
              className={cn(
                "p-2.5 rounded-xl transition-all hover:scale-110 cursor-pointer border",
                activeTab === "agent" 
                  ? "text-indigo-400 bg-indigo-500/20 border-indigo-500/30" 
                  : "text-zinc-500 border-transparent hover:text-zinc-100"
              )}
            >
              <Layers className="w-5 h-5" />
            </button>
            <div className="p-2.5 text-zinc-500 hover:text-zinc-100 transition-all hover:scale-110 cursor-pointer">
              <FileText className="w-5 h-5" />
            </div>
            <div className="mt-auto p-2.5 text-zinc-500 hover:text-zinc-100 transition-all hover:scale-110 cursor-pointer">
              <Activity className="w-5 h-5" />
            </div>
          </aside>

          {/* Main Chat/Terminal Section */}
          <section className="flex-1 flex flex-col bg-zinc-950/30 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  <Terminal onSwitchToAgent={() => setActiveTab("agent")} />
                </motion.div>
              ) : (
                <motion.div
                  key="agent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  <AgentView />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Contextual Bento Grid Sidebar */}
          <section className="w-80 border-l border-zinc-800 bg-zinc-950/80 backdrop-blur-md p-4 flex flex-col gap-3 overflow-y-auto hidden lg:flex">
            {/* Model Info Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-zinc-800/50 rounded-2xl p-4 shadow-sm">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Active Context</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center text-xl shadow-inner">
                  ♊
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Gemini 3 Flash</p>
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Latency: 140ms
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of Tools */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-3 flex flex-col justify-between h-24 hover:border-zinc-700/50 transition-colors group">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Postgres</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-zinc-600 font-medium">
                    <span>Queries</span>
                    <span>74%</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} className="h-full bg-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-3 flex flex-col justify-between h-24 hover:border-zinc-700/50 transition-colors group">
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">GitHub</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-zinc-600 font-medium">
                    <span>Sync</span>
                    <span>92%</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-zinc-100" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Services */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex-1 min-h-[160px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">MCP Servers</h3>
                <span className="text-[9px] bg-zinc-800/80 px-2 py-0.5 rounded-full text-zinc-400 font-medium border border-zinc-700/50">3 Active</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Slack-Connector", icon: Globe, status: "online" },
                  { name: "Localhost:5432", icon: Database, status: "online" },
                  { name: "Redis-Stack", icon: Cpu, status: "standby" }
                ].map((svc, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-2.5">
                      <svc.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{svc.name}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-zinc-700'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 italic flex items-center gap-1.5">
                <Zap className="w-2.5 h-2.5 text-yellow-500" /> Session Metadata
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-zinc-800/30 rounded-xl border border-zinc-800/50 flex flex-col gap-0.5">
                  <p className="text-[8px] text-zinc-500 font-bold uppercase">Tokens In</p>
                  <p className="text-xs font-mono text-zinc-300">28.4k</p>
                </div>
                <div className="p-2.5 bg-zinc-800/30 rounded-xl border border-zinc-800/50 flex flex-col gap-0.5">
                  <p className="text-[8px] text-zinc-500 font-bold uppercase">Tokens Out</p>
                  <p className="text-xs font-mono text-zinc-300">4.7k</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </TooltipProvider>
  );
}
