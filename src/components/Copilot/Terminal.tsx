import { useState, useRef, useEffect } from "react";
import { 
  Terminal as TerminalIcon, 
  Send,
  Loader2,
  Command,
  Zap,
  User,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  role: "user" | "model";
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
      content: "Hello! I'm your Gemini CLI Assistant. I have context on this local project and the Gemini CLI documentation. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.0-flash");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

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
    <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden">
      {/* Terminal Internal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#050505] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
             <TerminalIcon className="w-3 h-3" />
             terminal:gemini
          </span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0a0a] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[9px] font-mono text-indigo-400 font-bold">READY</span>
           </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4" viewportRef={scrollRef}>
        <div className="space-y-6 max-w-full pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 group",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded shrink-0 flex items-center justify-center border",
                msg.role === "model" 
                  ? "bg-[#0a0a0a] border-white/10 text-indigo-400 font-mono text-[10px]" 
                  : "bg-indigo-600/20 border-indigo-500/30 text-indigo-400"
              )}>
                {msg.role === "model" ? "G" : <Command className="w-3 h-3" />}
              </div>
              
              <div className={cn(
                "relative max-w-[85%] space-y-1.5",
                msg.role === "user" ? "items-end text-right" : "items-start"
              )}>
                <div className={cn(
                  "px-3 py-2.5 rounded-md text-[13px] leading-relaxed border",
                  msg.role === "user" 
                    ? "bg-[#0a0a0a] border-white/5 text-zinc-200" 
                    : "bg-transparent border-transparent text-zinc-300 font-sans"
                )}>
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#111111] prose-pre:border prose-pre:border-zinc-800 prose-sm max-w-none break-words whitespace-pre-wrap">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}>
                   <span className="text-[9px] text-zinc-600 font-medium font-sans">
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length-1].content === "" && (
             <div className="flex items-center gap-2 text-zinc-500 animate-pulse ml-10 font-sans">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Process: Analyzing...</span>
             </div>
          )}
        </div>
      </ScrollArea>

      <div className="shrink-0 p-4 border-t border-white/5 bg-[#0a0a0a]">
          {/* Model Selector Bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-fit h-6 bg-[#111111] border-white/5 text-[10px] font-bold uppercase tracking-widest gap-2 focus:ring-0 rounded-md px-2 text-zinc-400">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-indigo-400" />
                  <SelectValue placeholder="Select Model" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#000000] border-white/10 text-zinc-100 rounded-md">
                {AVAILABLE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-[10px] uppercase tracking-widest focus:bg-[#111111] focus:text-indigo-400 cursor-pointer py-2">
                    <div className="flex flex-col py-0.5">
                       <span className="font-bold">{m.name}</span>
                       <span className="text-[8px] opacity-50 lowercase font-mono">{m.account}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3 bg-[#111111] px-2 py-1 rounded-md border border-white/5">
               <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-tight">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Turbo</span>
               </div>
               <div className="h-3 w-[1px] bg-white/10" />
               <span className="text-[9px] text-zinc-500 font-mono">1.2s</span>
            </div>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="bg-[#000000] border border-white/10 rounded-lg p-2.5 flex flex-col gap-2 transition-all focus-within:border-indigo-500/50"
          >
            <div className="flex gap-2 items-start">
              <textarea
                placeholder="Ask Copilot or use '/' for commands..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isTyping}
                className="bg-transparent resize-none outline-none text-sm text-zinc-200 w-full h-12 py-1 px-1 placeholder:text-zinc-600 font-sans"
              />
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div className="flex gap-2">
                <Badge variant="outline" className="h-5 bg-[#111111] border-white/5 text-zinc-500 text-[9px] font-mono px-2 rounded">
                   ⌘ K Cmd
                </Badge>
                <Badge variant="outline" className="h-5 bg-[#111111] border-white/5 text-zinc-500 text-[9px] font-mono px-2 rounded">
                   @ Ctx
                </Badge>
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="h-7 px-4 bg-zinc-200 text-zinc-950 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
              >
                {isTyping ? "..." : "Send"}
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
}
