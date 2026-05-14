import { motion } from "motion/react";
import { 
  Wifi, 
  Bluetooth, 
  Plane, 
  Moon, 
  Sun, 
  Volume2, 
  Battery, 
  Activity, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCcw,
  Search,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ServiceItem {
  name: string;
  status: "running" | "stopped" | "starting";
  cpu: number;
}

export function AgentView() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [flightMode, setFlightMode] = useState(false);
  const [focus, setFocus] = useState(false);
  
  const [health, setHealth] = useState({
    cpu: 42,
    ram: 68,
    temp: 54,
    disk: 31
  });

  // Simulate hardware changes
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(prev => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(20, Math.min(90, prev.ram + (Math.random() * 2 - 1))),
        temp: Math.max(40, Math.min(80, prev.temp + (Math.random() * 4 - 2))),
        disk: prev.disk
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const services: ServiceItem[] = [
    { name: "Windows Search", status: "running", cpu: 0.2 },
    { name: "Gemini CLI Core", status: "running", cpu: 2.4 },
    { name: "Docker Desktop", status: "stopped", cpu: 0 },
    { name: "SQL Server (SQLEXPRESS)", status: "running", cpu: 1.1 },
    { name: "Print Spooler", status: "running", cpu: 0.1 },
    { name: "Windows Update", status: "starting", cpu: 0.8 },
  ];

  const events = [
    { time: "22:31:04", type: "info", msg: "Gemini handshake persistent." },
    { time: "22:30:12", type: "warning", msg: "High disk I/O detected on path /src." },
    { time: "22:28:45", type: "info", msg: "Copilot session initialized." },
    { time: "22:25:00", type: "error", msg: "Service 'Docker' failed to resume." },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-zinc-950/20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Agent</h2>
            <p className="text-sm text-zinc-500">Monitoring local infrastructure and workspace health.</p>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1">
                SECURE
             </Badge>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Action Center - Windows 11 style */}
          <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> Action Center
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Wi-Fi", icon: Wifi, state: wifi, setter: setWifi },
                { label: "Bluetooth", icon: Bluetooth, state: bluetooth, setter: setBluetooth },
                { label: "Flight Mode", icon: Plane, state: flightMode, setter: setFlightMode },
                { label: "Focus", icon: Moon, state: focus, setter: setFocus },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.setter(!item.state)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 group",
                    item.state 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", item.state ? "animate-pulse" : "opacity-50")} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun className="w-4 h-4 text-zinc-500" />
                    <div className="h-1.5 w-32 bg-zinc-800 rounded-full">
                       <div className="h-full w-2/3 bg-zinc-100 rounded-full" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold">66%</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-zinc-500" />
                    <div className="h-1.5 w-32 bg-zinc-800 rounded-full">
                       <div className="h-full w-1/2 bg-zinc-100 rounded-full" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold">50%</span>
               </div>
            </div>
          </div>

          {/* System Health */}
          <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Diagnostics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: "CPU", val: Math.round(health.cpu), icon: Cpu, color: "text-blue-400" },
                 { label: "RAM", val: Math.round(health.ram), icon: Activity, color: "text-purple-400" },
                 { label: "DISK", val: health.disk, icon: HardDrive, color: "text-zinc-400" },
                 { label: "TEMP", val: Math.round(health.temp), icon: Sun, color: "text-orange-400" },
               ].map((stat) => (
                 <div key={stat.label} className="p-3 bg-zinc-800/30 border border-zinc-800 rounded-xl flex flex-col gap-1">
                    <stat.icon className={cn("w-4 h-4 mb-1", stat.color)} />
                    <span className="text-[9px] font-bold text-zinc-500">{stat.label}</span>
                    <span className="text-lg font-bold font-mono tracking-tighter">{stat.val}{stat.label === 'TEMP' ? '°C' : '%'}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-3 pt-2">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-zinc-400">Battery Status</span>
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold">88%</span>
                  </div>
               </div>
               <Progress value={88} className="h-1 bg-zinc-800" />
            </div>
          </div>

          {/* Services Panel */}
          <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <RefreshCcw className="w-3.5 h-3.5 text-zinc-400" /> Windows Services
              </h3>
              <Search className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 cursor-pointer" />
            </div>
            <ScrollArea className="flex-1 -mx-2 px-2">
               <div className="space-y-3">
                  {services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{s.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">{s.status} • {s.cpu}% CPU</span>
                       </div>
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         s.status === 'running' ? "bg-emerald-500" : s.status === 'starting' ? "bg-yellow-500 animate-pulse" : "bg-zinc-700"
                       )} />
                    </div>
                  ))}
               </div>
            </ScrollArea>
          </div>

          {/* System Events - Wide */}
          <div className="col-span-1 md:col-span-3 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> System Event Log
            </h3>
            <div className="space-y-2">
               {events.map((ev, i) => (
                 <div key={i} className="flex items-center gap-4 py-2 border-b border-zinc-800/50 last:border-0 group">
                    <span className="text-[10px] font-mono text-zinc-600 shrink-0">{ev.time}</span>
                    {ev.type === 'error' ? <AlertCircle className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 border border-zinc-700 rounded-full group-hover:border-zinc-500 transition-colors" />}
                    <span className={cn(
                      "text-xs",
                      ev.type === 'error' ? "text-red-400" : ev.type === 'warning' ? "text-yellow-400" : "text-zinc-400"
                    )}>{ev.msg}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Expose Widget - Visual Placeholder */}
          <div className="col-span-1 md:col-span-3 bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Search className="w-6 h-6 text-white" />
             </div>
             <div>
                <h3 className="text-lg font-bold">Exposed Widgets Interface</h3>
                <p className="text-sm text-zinc-500 max-w-md mt-1">
                   Gemini CLI has identified 4 desktop widgets ready for integration. 
                   Scan the viewport to overlay real-time telemetry.
                </p>
             </div>
             <button className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-xl text-xs font-black hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                SCAN VIEWPORT
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
