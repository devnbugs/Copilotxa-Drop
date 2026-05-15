import { useState, useRef, useEffect } from "react";
import { 
  Send,
  Loader2,
  Command,
  Zap,
  User,
  Monitor,
  Bot,
  Terminal as TerminalIcon,
  Copy,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
  isAgent?: boolean;
}

const AVAILABLE_MODELS = [
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview", account: "devnbugs@gmail.com" },
  { id: "gemini-3.0-flash", name: "Gemini 3 Flash", account: "devnbugs@gmail.com" },
  { id: "gemini-3.0-pro", name: "Gemini 3 Pro", account: "devnbugs@gmail.com" },
];

export function Terminal({ 
  onSwitchToAgent,
  externalCommand,
  onExternalCommandExecuted,
  isPlanMode = false
}: { 
  onSwitchToAgent?: () => void;
  externalCommand?: string | null;
  onExternalCommandExecuted?: () => void;
  isPlanMode?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I'm your Gemini Assistant. How can I help you with your tasks today?",
      timestamp: new Date()
    }
  ]);
  const [shellMessages, setShellMessages] = useState<Message[]>([
    { role: "system", content: "Local Terminal Bridge Active\nConnected to host: Windows 11\nType 'gemini auth login' to authenticate locally.", timestamp: new Date()}
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");
  const [isShellMode, setIsShellMode] = useState(true);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, index: number, isShell: boolean } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ index: number, isShell: boolean } | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (externalCommand) {
      if (!isShellMode) {
        setIsShellMode(true);
      }
      executeShellCommand(externalCommand);
      if (onExternalCommandExecuted) {
        onExternalCommandExecuted();
      }
    }
  }, [externalCommand]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shellMessages, isTyping, isShellMode]);

  const handleContextMenu = (e: React.MouseEvent, index: number, isShell: boolean) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, index, isShell });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu) {
      if (contextMenu.isShell) {
        setShellMessages(prev => prev.filter((_, i) => i !== contextMenu.index));
      } else {
        setMessages(prev => prev.filter((_, i) => i !== contextMenu.index));
      }
      setContextMenu(null);
    }
  };

  const handleEdit = () => {
    if (contextMenu) {
      setEditingMessage({ index: contextMenu.index, isShell: contextMenu.isShell });
      const msg = contextMenu.isShell ? shellMessages[contextMenu.index] : messages[contextMenu.index];
      setEditText(msg.content);
      setContextMenu(null);
    }
  };

  const saveEdit = () => {
    if (editingMessage) {
      if (editingMessage.isShell) {
        setShellMessages(prev => prev.map((msg, i) => i === editingMessage.index ? { ...msg, content: editText } : msg));
      } else {
        setMessages(prev => prev.map((msg, i) => i === editingMessage.index ? { ...msg, content: editText } : msg));
      }
      setEditingMessage(null);
    }
  };

  const executeShellCommand = async (cmdStr: string) => {
    if (!cmdStr.trim()) return;

    const userCmd: Message = { role: "user", content: cmdStr, timestamp: new Date() };
    setShellMessages(prev => [...prev, userCmd]);
    
    if (cmdStr.trim() && commandHistory[commandHistory.length - 1] !== cmdStr.trim()) {
      setCommandHistory(prev => [...prev, cmdStr.trim()]);
    }
    setHistoryIndex(-1);
    setTempInput("");
    
    setIsTyping(true);

    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdStr })
      });
      
      const data = await response.json();
      const output = data.stdout || data.stderr || data.error || "Command completed with no output.";

      setShellMessages(prev => [...prev, {
        role: "model",
        content: output,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      setShellMessages(prev => [...prev, {
        role: "model",
        content: `Terminal Error: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeChatCommand = async (cmdStr: string) => {
    if (!cmdStr.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: cmdStr,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    let fullText = "";
    
    try {
      const { streamChat } = await import('../../services/gemini');
      let chatTarget = [...messages, userMessage].filter(m => m.role !== 'system') as import('../../services/gemini').Message[];
      
      // Inject Agent System Instruction if in Agent Mode
      if (isAgentMode) {
        const planModeText = isPlanMode ? "\n\nCRITICAL: You are in PLAN MODE. You must only suggest changes and explain your reasoning. DO NOT execute any shell commands or modifying tools directly. Provide a clear plan for the user to review." : "";
        chatTarget = [
          { 
            role: "system", 
            content: "You are an autonomous Gemini Agent. You are capable of performing complex multi-step tasks, analyzing local files, and executing shell commands through the Gemini CLI. Always think step-by-step and use tools when necessary. Your personality is professional, precise, and highly capable." + planModeText,
            timestamp: new Date()
          } as any,
          ...chatTarget
        ];
      }

      const responseStream = streamChat(chatTarget, selectedModel);
      
      setMessages(prev => [...prev, {
        role: "model",
        content: "",
        timestamp: new Date(),
        isAgent: isAgentMode
      }]);

      for await (const chunk of responseStream) {
        fullText += chunk;
        setMessages(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, content: fullText } : msg));
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "model",
        content: `Error: ${error instanceof Error ? error.message : String(error)}\n\nPlease ensure your Gemini API Key is configured.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isShellMode) {
      executeShellCommand(input);
    } else {
      executeChatCommand(input);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-background relative overflow-hidden">
      {/* Top Bar Navigation Additions */}
      <div className="absolute top-4 w-full px-4 flex justify-between z-10 pointer-events-none">
         <div className="pointer-events-auto">
           {/* Can add extra left tools here */}
         </div>
         {/* Model Selector Bar at Top (Optional) */}
         <div className="pointer-events-auto shadow-sm rounded-full">
           <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-fit h-9 bg-card/80 backdrop-blur-md border border-border text-xs font-medium gap-2 focus:ring-0 rounded-full px-4 text-foreground">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <SelectValue placeholder="Select Model" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-2xl">
                {AVAILABLE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs focus:bg-muted focus:text-foreground cursor-pointer py-2 border-b border-transparent">
                    <div className="flex flex-col py-0.5">
                       <span className="font-semibold">{m.name}</span>
                       <span className="text-[10px] opacity-70 font-mono">{m.account}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
           </Select>
         </div>
         <div className="pointer-events-auto">
           <Button 
             variant={isShellMode ? "default" : "outline"} 
             size="sm" 
             onClick={() => setIsShellMode(!isShellMode)}
             className="h-9 rounded-full gap-2 text-xs font-bold shadow-sm"
           >
             <TerminalIcon className="w-4 h-4" />
             Shell Mode
           </Button>
         </div>
      </div>

      <div className={cn("flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar", isShellMode ? "bg-[#050505] pt-20" : "pt-20")} ref={scrollRef}>
        
        {isShellMode ? (
          <div className="max-w-4xl mx-auto min-h-full font-mono text-sm leading-relaxed p-4 selection:bg-indigo-500/30">
            {shellMessages.map((msg, i) => (
              <div 
                key={i} 
                className="mb-4 group/msg relative rounded-md px-2 py-1 -mx-2 hover:bg-white/5 transition-colors"
                onContextMenu={(e) => handleContextMenu(e, i, true)}
              >
                {editingMessage?.index === i && editingMessage?.isShell ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <textarea 
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className="bg-[#111] text-zinc-200 p-3 rounded-md w-full font-mono text-sm border border-zinc-700 outline-none resize-none"
                      rows={Math.max(2, editText.split('\n').length)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)} className="h-7 text-xs text-zinc-400 hover:text-zinc-200">Cancel</Button>
                      <Button size="sm" onClick={saveEdit} className="h-7 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Save</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.role === 'system' && (
                      <div className="text-zinc-500 whitespace-pre-wrap mb-2">{msg.content}</div>
                    )}
                    {msg.role === 'user' && (
                      <div className="text-emerald-400">
                        <span className="text-zinc-500 mr-2">$</span>{msg.content}
                      </div>
                    )}
                    {msg.role === 'model' && (
                      <div className="text-zinc-300 mt-2 whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="text-emerald-400 animate-pulse">
                <span className="text-zinc-500 mr-2">$</span>
                <Loader2 className="w-3 h-3 inline animate-spin text-zinc-500 ml-2" />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 min-h-full">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-4 w-full group relative",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
                onContextMenu={(e) => handleContextMenu(e, i, false)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm relative",
                  msg.role === "model" 
                    ? (msg.isAgent ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-card border-border text-indigo-400") 
                    : "bg-muted border-border text-foreground"
                )}>
                  {msg.role === "model" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {msg.isAgent && (
                    <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-0.5 border border-background">
                      <Zap className="w-2 h-2 fill-white" />
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "relative max-w-[85%] space-y-2",
                  msg.role === "user" ? "items-end text-right" : "items-start",
                  editingMessage?.index === i && !editingMessage?.isShell ? "w-full" : ""
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[14px] leading-relaxed",
                    msg.role === "user" 
                      ? "bg-muted text-foreground rounded-tr-sm" 
                      : "bg-transparent text-foreground rounded-tl-sm shadow-none py-1 px-1",
                    editingMessage?.index === i && !editingMessage?.isShell ? "w-full bg-card border shadow-sm" : ""
                  )}>
                    {editingMessage?.index === i && !editingMessage?.isShell ? (
                      <div className="flex flex-col gap-2 w-full text-left">
                        <textarea 
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="bg-transparent text-foreground p-2 rounded-md w-full font-sans text-sm outline-none resize-none min-h-[80px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingMessage(null)} className="h-8 text-xs">Cancel</Button>
                          <Button size="sm" onClick={saveEdit} className="h-8 text-xs">Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className={cn("prose prose-sm max-w-none break-words whitespace-pre-wrap dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border", msg.role === "user" ? "text-foreground" : "")}>
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}
                  </div>
                  {/* Timestamp hidden by default, shown on hover like normal AI chats */}
                  {!(editingMessage?.index === i && !editingMessage?.isShell) && (
                    <div className={cn(
                      "flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}>
                       <span className="text-[10px] text-muted-foreground font-medium font-sans">
                         {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length-1].content === "" && (
               <div className="flex gap-4 w-full">
                 <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm bg-card border-border text-indigo-400">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="flex items-center gap-2 text-muted-foreground animate-pulse font-sans">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium">Generating response...</span>
                 </div>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Input Area at Bottom */}
      <div className={cn("absolute bottom-0 w-full pb-6 pt-10 px-4", isShellMode ? "bg-gradient-to-t from-[#050505] via-[#050505] to-transparent" : "bg-gradient-to-t from-background via-background to-transparent")}>
          <div className={cn("mx-auto", isShellMode ? "max-w-4xl" : "max-w-3xl")}>
            <form 
              onSubmit={handleSubmit} 
              className={cn(
                "border shadow-2xl rounded-[1.5rem] p-3 flex flex-col gap-2 transition-all focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/10",
                isShellMode ? "bg-[#0a0a0a] border-white/10" : "bg-card border-border"
              )}
            >
              <div className="flex gap-2 items-start">
                <textarea
                  placeholder={isShellMode ? "Enter CLI command..." : "Ask Gemini..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    } else if (isShellMode && e.key === 'ArrowUp') {
                      e.preventDefault();
                      if (commandHistory.length > 0) {
                        const newIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                        if (historyIndex === -1) {
                            setTempInput(input);
                        }
                        setHistoryIndex(newIdx);
                        setInput(commandHistory[newIdx]);
                      }
                    } else if (isShellMode && e.key === 'ArrowDown') {
                      e.preventDefault();
                      if (historyIndex !== -1) {
                        const newIdx = historyIndex + 1;
                        if (newIdx >= commandHistory.length) {
                          setHistoryIndex(-1);
                          setInput(tempInput);
                        } else {
                          setHistoryIndex(newIdx);
                          setInput(commandHistory[newIdx]);
                        }
                      }
                    }
                  }}
                  disabled={isTyping}
                  className={cn(
                    "bg-transparent resize-none outline-none text-base w-full py-2 px-2 min-h-[44px] max-h-[200px]",
                    isShellMode ? "text-zinc-200 font-mono text-sm placeholder:text-zinc-600" : "text-foreground font-sans placeholder:text-muted-foreground"
                  )}
                  style={{ height: Math.max(44, Math.min(200, input.split('\n').length * 24)) }}
                />
              </div>
              
              <div className="flex justify-between items-center pt-1 px-1">
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isShellMode ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-muted")} title="Shortcuts">
                     <Command className="w-4 h-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsAgentMode(!isAgentMode)}
                    className={cn(
                      "h-8 flex items-center gap-2 px-3 rounded-full transition-all text-xs font-medium",
                      isAgentMode 
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                    )}
                    title={isAgentMode ? "Disable Agent Mode" : "Enable Agent Mode"}
                  >
                     <Zap className={cn("w-3.5 h-3.5", isAgentMode ? "fill-indigo-400" : "")} />
                     Agent Mode
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    "h-8 w-8 p-0 rounded-full transition-all disabled:opacity-50 border-none",
                    isShellMode 
                      ? "bg-zinc-200 text-black hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600" 
                      : "bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
                  )}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            {!isShellMode && (
              <div className="text-center mt-3">
                <span className="text-[10px] text-muted-foreground font-sans">Gemini can make mistakes. Check important info.</span>
              </div>
            )}
          </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-popover/90 backdrop-blur-md text-popover-foreground rounded-lg border shadow-xl p-1 min-w-[160px] flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ 
             top: Math.min(contextMenu.y, window.innerHeight - 150),
             left: Math.min(contextMenu.x, window.innerWidth - 180)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
             className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors w-full text-left"
             onClick={() => {
                const msg = contextMenu.isShell ? shellMessages[contextMenu.index] : messages[contextMenu.index];
                handleCopy(msg.content);
             }}
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button 
             className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors w-full text-left"
             onClick={handleEdit}
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <div className="h-[1px] bg-border my-1" />
          <button 
             className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-md transition-colors w-full text-left"
             onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
