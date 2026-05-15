import { useState, useRef, useEffect } from "react";
import { 
  Send,
  Loader2,
  Command,
  Zap,
  User,
  Monitor,
  Bot,
  Terminal as TerminalIcon
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
}

const AVAILABLE_MODELS = [
  { id: "gemini-3.0-flash", name: "Gemini 3 Flash", account: "devnbugs@gmail.com" },
  { id: "gemini-3.0-pro", name: "Gemini 3 Pro", account: "devnbugs@gmail.com" },
];

export function Terminal({ onSwitchToAgent }: { onSwitchToAgent?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I'm your Gemini Assistant. How can I help you with your tasks today?",
      timestamp: new Date()
    }
  ]);
  const [shellMessages, setShellMessages] = useState<Message[]>([
    { role: "system", content: "Gemini CLI v24.1.0 (Enterprise Edition)\nConnected to devnbugs@gmail.com\nType 'help' for available commands.", timestamp: new Date()}
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.0-flash");
  const [isShellMode, setIsShellMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shellMessages, isTyping, isShellMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isShellMode) {
      const userCmd: Message = { role: "user", content: input, timestamp: new Date() };
      setShellMessages(prev => [...prev, userCmd]);
      
      if (input.trim() && commandHistory[commandHistory.length - 1] !== input.trim()) {
        setCommandHistory(prev => [...prev, input.trim()]);
      }
      setHistoryIndex(-1);
      setTempInput("");
      
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        let output = "";
        const cmd = input.trim().toLowerCase();
        
        switch (cmd) {
          case "help":
            output = `Available Commands:
  gemini       Access the Gemini CLI interface
  mcp          Manage Model Context Protocol servers
  login        Re-authenticate via web browser or ADC
  config       Edit system-defaults.json
  sandbox      Start or stop local filesystem Docker sandbox
  clear        Clear the terminal output
  help         Show this message`;
            break;
          case "gemini":
            output = `Gemini CLI Interactive Mode
Type your prompt or enter 'ctrl+d' to exit.
Use 'gemini --help' for flag options like --model, --project.`;
            break;
          case "clear":
            setShellMessages([{ role: "system", content: "Terminal cleared.", timestamp: new Date()}]);
            setIsTyping(false);
            return;
          default:
            output = `command not found: ${input.split(' ')[0]}
Type 'help' for a list of valid commands.`;
        }

        setShellMessages(prev => [...prev, {
          role: "model",
          content: output,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 600);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "model",
        content: "I'm analyzing your request against the current context... \n\n*This is a frontend preview of the Gemini CLI interface!*",
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
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
              <div key={i} className="mb-4">
                {msg.role === 'system' && (
                  <div className="text-zinc-500 whitespace-pre-wrap mb-4">{msg.content}</div>
                )}
                {msg.role === 'user' && (
                  <div className="text-emerald-400">
                    <span className="text-zinc-500 mr-2">$</span>{msg.content}
                  </div>
                )}
                {msg.role === 'model' && (
                  <div className="text-zinc-300 mt-2 whitespace-pre-wrap">{msg.content}</div>
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
                  "flex gap-4 w-full group",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm",
                  msg.role === "model" 
                    ? "bg-card border-border text-indigo-400 font-mono text-xs" 
                    : "bg-muted border-border text-foreground"
                )}>
                  {msg.role === "model" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                
                <div className={cn(
                  "relative max-w-[85%] space-y-2",
                  msg.role === "user" ? "items-end text-right" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-[14px] leading-relaxed",
                    msg.role === "user" 
                      ? "bg-muted text-foreground rounded-tr-sm" 
                      : "bg-transparent text-foreground rounded-tl-sm shadow-none py-1 px-1"
                  )}>
                    <div className={cn("prose prose-sm max-w-none break-words whitespace-pre-wrap dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border", msg.role === "user" ? "text-foreground" : "")}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                  {/* Timestamp hidden by default, shown on hover like normal AI chats */}
                  <div className={cn(
                    "flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}>
                     <span className="text-[10px] text-muted-foreground font-medium font-sans">
                       {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
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
    </div>
  );
}
