import { useState } from "react";
import { X, Server, Webhook, Activity, ShieldCheck, ToggleLeft, ToggleRight, CirclePlay, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "services" | "subservices">("services");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl flex flex-col sm:flex-row h-[85vh] max-h-[800px] font-sans">
         <DialogHeader className="sr-only">
           <DialogTitle>Settings</DialogTitle>
         </DialogHeader>
         {/* Sidebar */}
         <div className="w-full sm:w-[240px] bg-card border-b sm:border-b-0 sm:border-r border-border shrink-0 flex flex-row sm:flex-col overflow-x-auto sm:overflow-x-hidden p-4">
            <h2 className="hidden sm:block text-xl font-bold mb-6 px-2 text-foreground tracking-tight">Settings</h2>
            <div className="flex flex-row sm:flex-col gap-1 sm:gap-0 sm:space-y-1 w-full flex-nowrap shrink-0 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
               <button
                 onClick={() => setActiveTab('general')}
                 className={cn(
                   "flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                   activeTab === 'general' ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                 )}
               >
                 <Activity className="w-4 h-4" /> General
               </button>
               <button
                 onClick={() => setActiveTab('services')}
                 className={cn(
                   "flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                   activeTab === 'services' ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                 )}
               >
                 <Server className="w-4 h-4" /> Agent Services
               </button>
               <button
                 onClick={() => setActiveTab('subservices')}
                 className={cn(
                   "flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                   activeTab === 'subservices' ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                 )}
               >
                 <Webhook className="w-4 h-4" /> Sub Services
               </button>
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div>
                    <h3 className="text-lg font-bold border-b border-border pb-3 mb-5 text-foreground">Global Settings</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                         <div>
                            <div className="font-medium text-foreground text-sm">Theme Interpolation</div>
                            <div className="text-xs text-muted-foreground">Automatically adjust theme based on system time.</div>
                         </div>
                         <ToggleLeft className="w-8 h-8 text-muted-foreground cursor-pointer" />
                       </div>
                       <div className="flex items-center justify-between">
                         <div>
                            <div className="font-medium text-foreground text-sm">Hardware Acceleration</div>
                            <div className="text-xs text-muted-foreground">Use GPU for webbed UI rendering and parsing.</div>
                         </div>
                         <ToggleRight className="w-8 h-8 text-emerald-400 cursor-pointer" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
                    <h3 className="text-lg font-bold text-foreground">MCP & Agent Services</h3>
                    <button className="px-3 py-1.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest rounded-md hover:bg-muted-foreground transition-colors">
                      + Add Service
                    </button>
                 </div>
                 
                 <div className="grid gap-4">
                    {[
                      { name: 'corp-tools (Enforced)', url: 'http://localhost:5000/mcp', status: 'active', desc: 'Provides global corporate utilities and ticket access.' },
                      { name: 'win-telemetry', url: 'stdio://win-telemetry-daemon', status: 'active', desc: 'Windows diagnostic reporting context tool.' },
                      { name: 'local-fs (Sandbox)', url: 'docker://sandbox/fs', status: 'stopped', desc: 'Secure local filesystem access for modifications.' }
                    ].map((svc, i) => (
                      <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card/50">
                         <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                               <div className={cn("w-2 h-2 rounded-full", svc.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
                               <div>
                                 <h4 className="font-bold text-sm text-foreground">{svc.name}</h4>
                                 <div className="text-[10px] text-muted-foreground font-mono mt-1">{svc.url}</div>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                 <CirclePlay className="w-4 h-4" />
                               </button>
                               <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                                 <Edit2 className="w-4 h-4" />
                               </button>
                               <button className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-muted rounded-md transition-colors">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                         <p className="text-xs text-muted-foreground">{svc.desc}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'subservices' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div>
                    <h3 className="text-lg font-bold border-b border-border pb-3 mb-5 text-foreground">Connected Sub Services</h3>
                    <div className="space-y-4">
                       {[
                         { title: 'Google Workspace Context', connected: true },
                         { title: 'Jira Software Ticket Tracker', connected: false },
                         { title: 'Slack Notifications Bot', connected: true }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                            <span className="text-sm font-medium text-foreground">{item.title}</span>
                            {item.connected ? (
                              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-indigo-500/20">
                                Connected
                              </span>
                            ) : (
                              <button className="px-2 py-1 bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors">
                                Connect
                              </button>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
         </div>
      </DialogContent>
    </Dialog>
  );
}
