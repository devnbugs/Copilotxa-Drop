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
  Webhook,
  Sparkles,
  Blocks,
  Bot
} from "lucide-react";
import { 
  MixerHorizontalIcon, 
  CubeIcon, 
  DesktopIcon, 
  ActivityLogIcon, 
  GearIcon,
  GlobeIcon,
  PlusIcon,
  ClipboardIcon
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ThemeName = 'default' | 'dracula' | 'solarized' | 'onedark';

const THEMES: Record<ThemeName, { name: string; bg: string; border: string; prompt: string; input: string; output: string; borderTop: string; }> = {
  default: { name: 'Default Dark', bg: 'bg-[#0a0a0a]', border: 'border-border', prompt: 'text-emerald-400', input: 'text-zinc-200', output: 'text-zinc-400', borderTop: 'border-white/5' },
  dracula: { name: 'Dracula', bg: 'bg-[#282a36]', border: 'border-[#44475a]', prompt: 'text-[#50fa7b]', input: 'text-[#f8f8f2]', output: 'text-[#6272a4]', borderTop: 'border-[#44475a]' },
  solarized: { name: 'Solarized Dark', bg: 'bg-[#002b36]', border: 'border-[#073642]', prompt: 'text-[#859900]', input: 'text-[#839496]', output: 'text-[#586e75]', borderTop: 'border-[#073642]' },
  onedark: { name: 'One Dark', bg: 'bg-[#282c34]', border: 'border-[#abb2bf]/20', prompt: 'text-[#98c379]', input: 'text-[#abb2bf]', output: 'text-[#5c6370]', borderTop: 'border-[#abb2bf]/20' }
};

export function AgentView({ onExecuteCommand, isPlanMode, setIsPlanMode }: { 
  onExecuteCommand?: (cmd: string) => void,
  isPlanMode?: boolean,
  setIsPlanMode?: (val: boolean) => void 
}) {
  const [consoleTheme, setConsoleTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('agent_console_theme') as ThemeName;
    return (saved && THEMES[saved]) ? saved : 'default';
  });
  const [health, setHealth] = useState({ cpu: 12, ram: 45, disk: '3.2TB', temp: 42 });
  const [runtimeStatus, setRuntimeStatus] = useState({
    cli: 'v24.1.0',
    auth: 'Authorized',
    mcp: 'Connected',
    model: 'Gemini 3.1 Pro'
  });
  
  useEffect(() => {
    localStorage.setItem('agent_console_theme', consoleTheme);
  }, [consoleTheme]);
  
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
    network: false,
    firewall: false,
    daemon: false,
    mcp: false
  });

  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [toolConfig, setToolConfig] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('agent_tool_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
       fs: { url: 'stdio://local/fs', args: '--allow-write' },
       bash: { url: 'stdio://powershell', args: '-NoProfile' },
       telemetry: { url: 'stdio://win-telemetry', args: '--verbose' },
       mcp: { url: 'http://localhost:5000/mcp', args: '' }
    };
  });

  const [skills, setSkills] = useState([
    { id: 'copilotx-agent', name: 'Autonomous Agent', description: 'Self-correcting AI that performs multi-step reasoning.', enabled: false },
    { id: 'code-review', name: 'Code Reviewer', description: 'Deep analysis of PRs and code quality.', enabled: false },
    { id: 'security-audit', name: 'Security Auditor', description: 'Scans for vulnerabilities and secrets.', enabled: false },
    { id: 'sys-admin', name: 'System Admin', description: 'Advanced OS level troubleshooting.', enabled: false },
    { id: 'doc-gen', name: 'Docs Generator', description: 'Auto-generates README and JSDocs.', enabled: false }
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Migrate to Radix UI', status: 'completed', subtasks: 4 },
    { id: 2, title: 'Implement Gemini CLI Auth', status: 'in-progress', subtasks: 2 },
    { id: 3, title: 'Add Task Tracker Component', status: 'pending', subtasks: 5 }
  ]);

  useEffect(() => {
    localStorage.setItem('agent_tool_config', JSON.stringify(toolConfig));
  }, [toolConfig]);

  const [events, setEvents] = useState([
    { time: '14:22:01', msg: 'MCP Server "win-telemetry" attached on Win11', type: 'info' },
    { time: '14:21:45', msg: 'Agent memory budget exceeded 85% threshold', type: 'warning' },
    { time: '14:20:12', msg: 'Failed to bind port 5432: Address in use', type: 'error' },
    { time: '14:15:00', msg: 'Model Context Protocol started successfully', type: 'info' }
  ]);

  const [consoleOutput, setConsoleOutput] = useState<{type: 'input'|'output', content: string}[]>([
    { type: 'output', content: 'Windows 11 System Agent initialized.' },
    { type: 'output', content: 'Type "help" for a list of commands.' }
  ]);
  const [consoleInput, setConsoleInput] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim();
    setConsoleOutput(prev => [...prev, { type: 'input', content: cmd }]);
    setConsoleInput('');

    setTimeout(() => {
      let response = '';
      switch(cmd.toLowerCase()) {
        case 'help':
          response = 'Available commands: help, status, clear, ping, mcp --status';
          break;
        case 'status':
          response = `System Status:\nCPU: ${Math.round(health.cpu)}%\nRAM: ${Math.round(health.ram)}%\nTemp: ${Math.round(health.temp)}°C`;
          break;
        case 'clear':
          setConsoleOutput([]);
          return;
        case 'ping':
          response = 'pong';
          break;
        case 'mcp --status':
          response = 'MCP Services: Running\nConnected Tools: fs, bash, telemetry';
          break;
        default:
          if (cmd.startsWith("echo ")) {
            response = cmd.substring(5).replace(/^['"]|['"]$/g, '');
          } else if (onExecuteCommand) {
            onExecuteCommand(cmd);
            response = `Command forwarded to main terminal: ${cmd}`;
          } else {
            response = `command not found: ${cmd}`;
          }
      }
      if (response) {
        setConsoleOutput(prev => [...prev, { type: 'output', content: response }]);
      }
    }, 400);
  };


  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-transparent relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> Windows 11 System Agent</span>
          <span className="text-[9px] text-muted-foreground font-mono">MCP Protocol active • v24H2</span>
        </div>
        <Badge variant="outline" className="bg-muted text-emerald-400 border-border py-0 h-5 text-[9px] uppercase tracking-widest rounded">
           SECURE
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 custom-scrollbar">
        <div className="space-y-4">
          
          {/* System Identity */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Agent Identity</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Gemini Orchestrator</span>
                <span className="text-[10px] text-muted-foreground font-mono">ID: AI-NODE-24H2-X</span>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
               <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[8px] py-0">CLI MODE</Badge>
               <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] py-0">STABLE</Badge>
            </div>
          </div>

          {/* Plan Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg group hover:border-indigo-500/40 transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                isPlanMode ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              )}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-foreground">Plan Mode</span>
                <span className="text-[9px] text-muted-foreground leading-tight">Review agent actions before they execute.</span>
              </div>
            </div>
            <button 
              onClick={() => setIsPlanMode?.(!isPlanMode)}
              className={cn(
                "w-9 h-5 rounded-full transition-all relative",
                isPlanMode ? "bg-indigo-500" : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-md",
                isPlanMode ? "right-1" : "left-1"
              )} />
            </button>
          </div>

          {/* Interactive Console */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <TerminalSquare className="w-3 h-3 text-emerald-400" /> Interactive Console
              </h3>
              <Select value={consoleTheme} onValueChange={(val: ThemeName) => setConsoleTheme(val)}>
                <SelectTrigger className="w-[120px] h-6 text-[10px] bg-background border-border rounded">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <SelectItem key={key} value={key} className="text-[10px] focus:bg-muted cursor-pointer transition-colors">
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={cn("border rounded-lg p-3 flex flex-col gap-2 h-48 font-mono text-xs shadow-inner transition-colors duration-300", THEMES[consoleTheme].bg, THEMES[consoleTheme].border)}>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                  {consoleOutput.map((x, i) => (
                      <div key={i} className={cn("break-words whitespace-pre-wrap leading-relaxed", x.type === 'input' ? THEMES[consoleTheme].input : THEMES[consoleTheme].output)}>
                          {x.type === 'input' ? <span className={cn("mr-2 font-bold", THEMES[consoleTheme].prompt)}>$</span> : null}
                          {x.content}
                      </div>
                  ))}
                  <div ref={consoleEndRef} />
               </div>
               <form onSubmit={handleConsoleSubmit} className={cn("flex gap-2 items-center border-t pt-2 transition-colors duration-300", THEMES[consoleTheme].borderTop)}>
                  <span className={cn("font-bold", THEMES[consoleTheme].prompt)}>$</span>
                  <input 
                    type="text" 
                    value={consoleInput}
                    onChange={e => setConsoleInput(e.target.value)}
                    className={cn("flex-1 bg-transparent outline-none placeholder:-translate-y-px text-[10px]", THEMES[consoleTheme].input, THEMES[consoleTheme].output.replace('text-', 'placeholder:text-'))} 
                    placeholder="Type a command (e.g. status) and press Enter..."
                  />
               </form>
            </div>
          </div>

          {/* CLI Shortcuts */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-4">
             <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <TerminalSquare className="w-3 h-3 text-indigo-400" /> CLI Shortcuts
             </h3>
             <div className="flex flex-col gap-2">
                {[
                  { label: "Authenticate CLI", cmd: "gemini auth login" },
                  { label: "Show Help", cmd: "gemini --help" },
                  { label: "Start Interactive CLI", cmd: "gemini" },
                  { label: "Clear Terminal", cmd: "clear" }
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => onExecuteCommand && onExecuteCommand(action.cmd)}
                    className="flex items-center justify-between px-3 py-2 bg-muted hover:bg-muted/80 text-foreground transition-colors rounded-md group text-left border border-border"
                  >
                    <span className="text-xs font-medium">{action.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground group-hover:text-indigo-400 transition-colors">
                      {action.cmd}
                    </span>
                  </button>
                ))}
             </div>
          </div>
          
          {/* MCP Tools View */}
          <div className="bg-background border border-border rounded-lg p-4 flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <GlobeIcon className="w-3 h-3 text-purple-400" /> Model Context Protocol
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'fs', label: 'Local FS', icon: CubeIcon, state: true },
                { id: 'bash', label: 'PowerShell', icon: ActivityLogIcon, state: true },
                { id: 'telemetry', label: 'Win EventLog', icon: DesktopIcon, state: true },
                { id: 'mcp', label: 'MCP Service', icon: GlobeIcon, state: toggles.mcp, setter: (v:any) => setToggles(p => ({...p, mcp: v})) }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelectedTool(item);
                  }}
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

          {/* Agent Skills */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400" /> Agent Skills
              </div>
              <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-amber-500/30 text-amber-500">BETA</Badge>
            </h3>
            
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-2 rounded-md bg-card border border-border hover:border-amber-500/20 transition-all group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      {skill.name}
                      {skill.enabled && <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{skill.description}</span>
                  </div>
                  <button 
                    onClick={() => setSkills(skills.map(s => s.id === skill.id ? { ...s, enabled: !s.enabled } : s))}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      skill.enabled ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Blocks className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest border-dashed border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all">
              <PlusIcon className="w-3 h-3 mr-2" /> Load Custom Skill
            </Button>
          </div>

          {/* AI Runtime Health */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-400" /> AI Runtime Health
              </div>
              <Badge variant="outline" className="text-[8px] h-4 bg-amber-500/10 border-amber-500/20 text-amber-400">STABLE</Badge>
            </h3>
            
            <div className="space-y-3">
              {[
                { label: 'Gemini CLI', value: runtimeStatus.cli, icon: TerminalSquare, status: 'ok' },
                { label: 'Auth Method', value: (localStorage.getItem('GEMINI_AUTH_METHOD') || 'cli').toUpperCase(), icon: Lock, status: 'ok' },
                { label: 'MCP Bridge', value: runtimeStatus.mcp, icon: Webhook, status: 'ok' },
                { label: 'Primary Model', value: runtimeStatus.model, icon: Sparkles, status: 'ok' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-foreground">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExecuteCommand?.('gemini doctor')}
                className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/5 transition-all"
              >
                Run Doctor
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExecuteCommand?.('gemini auth status')}
                className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/5 transition-all"
              >
                Check Auth
              </Button>
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
          <div className="bg-background border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <ClipboardIcon className="w-3 h-3 text-emerald-400" /> Active Tasks
               </h3>
               <Badge variant="outline" className="text-[9px] h-4 bg-muted/50 border-emerald-500/20 text-emerald-400 px-1.5">
                 {tasks.filter(t => t.status === 'in-progress').length} Running
               </Badge>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="space-y-1.5">
                   <div className="flex items-center justify-between">
                     <span className="text-[11px] font-medium text-foreground">{task.title}</span>
                     <span className="text-[9px] text-muted-foreground">{task.status === 'completed' ? 'Done' : `${task.subtasks} subtasks`}</span>
                   </div>
                   <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full transition-all duration-1000",
                        task.status === 'completed' ? "bg-emerald-500 w-full" : 
                        task.status === 'in-progress' ? "bg-indigo-500 w-1/2" : "bg-muted-foreground/20 w-0"
                      )} />
                   </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full h-8 mt-4 text-[10px] font-bold uppercase tracking-widest border-dashed border-border hover:bg-muted/50 transition-all">
               View Task Graph
            </Button>
          </div>

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

      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="max-w-xs w-[90vw] p-4 bg-background border border-border shadow-xl rounded-xl">
           <DialogHeader>
             <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                 {selectedTool && <selectedTool.icon className="w-4 h-4 text-indigo-400" />}
                 Configure {selectedTool?.label}
             </DialogTitle>
           </DialogHeader>
           
           {selectedTool && (
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                   <label className="text-xs font-medium text-muted-foreground">Server URL / Source</label>
                   <Input 
                     value={toolConfig[selectedTool.id]?.url || ''} 
                     onChange={(e) => setToolConfig(prev => ({ ...prev, [selectedTool.id]: { ...prev[selectedTool.id], url: e.target.value } }))}
                     className="h-8 text-xs font-mono"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-medium text-muted-foreground">Parameters (Args)</label>
                   <Input 
                     value={toolConfig[selectedTool.id]?.args || ''} 
                     onChange={(e) => setToolConfig(prev => ({ ...prev, [selectedTool.id]: { ...prev[selectedTool.id], args: e.target.value } }))}
                     className="h-8 text-xs font-mono"
                   />
                </div>
                
                <div className="flex gap-2 justify-end pt-2">
                   <Button variant="ghost" size="sm" onClick={() => setSelectedTool(null)} className="h-8 text-xs">Cancel</Button>
                   <Button size="sm" onClick={() => {
                      if (selectedTool.setter) {
                        selectedTool.setter(true);
                      }
                      if (onExecuteCommand) {
                        onExecuteCommand(`echo 'Configuring ${selectedTool.label} -> ${toolConfig[selectedTool.id]?.url} ${toolConfig[selectedTool.id]?.args}'`);
                        setTimeout(() => onExecuteCommand(`echo '${selectedTool.label} Service restarted successfully.'`), 600);
                      }
                      setSelectedTool(null);
                   }} className="h-8 text-xs bg-indigo-500 hover:bg-indigo-600 text-white">Save & Restart</Button>
                </div>
              </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
