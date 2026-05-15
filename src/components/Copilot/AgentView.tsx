import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Search, 
  TerminalSquare, 
  Wifi, 
  Database,
  Lock,
  Globe,
  Sun,
  Battery,
  AlertCircle,
  ShieldCheck,
  Volume2,
  Zap,
  RefreshCcw,
  Monitor,
  Webhook
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AgentView() {
  const [health, setHealth] = useState({ cpu: 12, ram: 45, disk: '3.2TB', temp: 42 });
  
  useEffect(() => {
    const i = setInterval(() => {
      setHealth(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.min(100, Math.max(0, prev.ram + (Math.random() * 4 - 2))),
        temp: Math.min(90, Math.max(30, prev.temp + (Math.random() * 2 - 1)))
      }));
    }, 2000);
    return () => clearInterval(i);
  }, []);

  const [toggles, setToggles] = useState({
    network: true,
    firewall: true,
    daemon: false,
    mcp: true
  });

  const events = [
    { time: '14:22:01', msg: 'MCP Server "win-telemetry" attached on Win11', type: 'info' },
    { time: '14:21:45', msg: 'Agent memory budget exceeded 85% threshold', type: 'warning' },
    { time: '14:20:12', msg: 'Failed to bind port 5432: Address in use', type: 'error' },
    { time: '14:15:00', msg: 'Model Context Protocol started successfully', type: 'info' }
  ];

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-transparent relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> Windows 11 System Agent</span>
          <span className="text-[9px] text-muted-foreground font-mono">MCP Protocol active • v24H2</span>
        </div>
        <Badge variant="outline" className="bg-muted text-emerald-400 border-border py-0 h-5 text-[9px] uppercase tracking-widest rounded">
           SECURE
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          
          {/* MCP Tools View */}
          <div className="bg-background border border-border rounded-lg p-4 flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Webhook className="w-3 h-3 text-purple-400" /> Model Context Protocol
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'fs', label: 'Local FS', icon: HardDrive, state: true },
                { id: 'bash', label: 'PowerShell', icon: TerminalSquare, state: true },
                { id: 'telemetry', label: 'Win EventLog', icon: Activity, state: true },
                { id: 'mcp', label: 'MCP Service', icon: Webhook, state: toggles.mcp, setter: (v:any) => setToggles(p => ({...p, mcp: v})) }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.setter && item.setter(!item.state)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-md border transition-all duration-200 gap-1",
                    item.state 
                      ? "bg-muted border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                      : "bg-background border-border text-foreground hover:border-foreground/10 hover:bg-muted"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 mb-1", item.state ? "animate-pulse drop-shadow-sm text-purple-300" : "opacity-50")} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-3 pt-3 border-t border-border">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 w-full">
                    <Sun className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full w-2/3 bg-foreground rounded-full" />
                    </div>
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 w-full">
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                       <div className="h-full w-1/2 bg-foreground rounded-full" />
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 text-indigo-400" /> Host Diagnostics
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
               {[
                 { label: "CPU", val: Math.round(health.cpu), icon: Cpu, color: "text-blue-400" },
                 { label: "RAM", val: Math.round(health.ram), icon: Activity, color: "text-purple-400" },
                 { label: "DISK", val: health.disk, icon: HardDrive, color: "text-foreground" },
                 { label: "TEMP", val: Math.round(health.temp), icon: Sun, color: "text-orange-400" },
               ].map((stat) => (
                 <div key={stat.label} className="p-2.5 bg-card border border-border rounded-md flex flex-col gap-1">
                    <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                    <span className="text-[8px] font-bold text-muted-foreground pt-1">{stat.label}</span>
                    <span className="text-sm font-bold font-mono tracking-tighter text-foreground">{stat.val}{stat.label === 'TEMP' ? '°C' : '%'}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-2 pt-2">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Battery Status</span>
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-400">88%</span>
                  </div>
               </div>
               <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
               </div>
            </div>
          </div>

          {/* System Events */}
          <div className="bg-background border border-border rounded-lg p-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> OS Event Logs
            </h3>
            <div className="space-y-1">
               {events.map((ev, i) => (
                 <div key={i} className="flex flex-col gap-1 py-2 border-b border-border last:border-0 group hover:bg-muted px-2 rounded-md transition-colors -mx-2">
                    <div className="flex items-center gap-2">
                      {ev.type === 'error' ? <AlertCircle className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 border border-border rounded-full group-hover:border-foreground/20" />}
                      <span className="text-[9px] font-mono text-muted-foreground shrink-0">{ev.time}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium leading-relaxed pl-5",
                      ev.type === 'error' ? "text-red-400" : ev.type === 'warning' ? "text-yellow-400" : "text-foreground"
                    )}>{ev.msg}</span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
