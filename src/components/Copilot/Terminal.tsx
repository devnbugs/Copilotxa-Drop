import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Send, Sparkles, Command, Shield, Zap, ChevronDown, User, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Markdown } from "@/components/Markdown";
import { streamChat, Message } from "@/services/gemini";
import { motion, AnimatePresence } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mocking models from "CLI authenticated accounts"
const AVAILABLE_MODELS = [
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", account: "devnbugs@gmail.com", tier: "Free" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", account: "enterprise-pro@google.com", tier: "Premium" },
  { id: "gemini-Ultra", name: "Gemini Ultra", account: "admin@google.com", tier: "Enterprise" },
];

interface TerminalProps {
  onSwitchToAgent?: () => void;
}

export function Terminal({ onSwitchToAgent }: TerminalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Gemini Copilot v1.2.0 initialized. Systems online.\nHow can I assist your development today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const responseMessages = [...messages, userMessage];
      let fullResponse = "";
      
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "", timestamp: new Date() },
      ]);

      const stream = streamChat(responseMessages, selectedModel);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "ERROR: Communication link severed. Please check your API key in Secrets.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden">
      {/* Terminal Internal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-950/20">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <TerminalIcon className="w-3 h-3" />
            terminal:gemini --session-882
          </span>
        </div>
        <div className="flex items-center gap-4">
           {/* Agent Switcher Button */}
           <Button 
            variant="outline" 
            size="sm" 
            onClick={onSwitchToAgent}
            className="h-7 px-3 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-[10px] gap-1.5 font-bold uppercase tracking-widest"
           >
              <Monitor className="w-3 h-3 text-indigo-400" />
              Agent View
           </Button>
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_indigo]" />
              <span className="text-[10px] font-mono text-indigo-400">SYNCED</span>
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 font-mono" viewportRef={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-8 pb-32">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "flex gap-4",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border",
                msg.role === "model" 
                  ? "bg-zinc-800 border-zinc-700 text-indigo-400 font-mono text-xs" 
                  : "bg-indigo-600 border-indigo-500 text-white"
              )}>
                {msg.role === "model" ? "G" : <Command className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "group relative max-w-[85%] space-y-1.5",
                msg.role === "user" ? "items-end text-right" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-indigo-600/10 border border-indigo-500/20 text-zinc-100 rounded-tr-none" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none font-sans"
                )}>
                  <Markdown content={msg.content} />
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
            </motion.div>
          ))}
          {isTyping && messages[messages.length-1].content === "" && (
             <div className="flex items-center gap-3 text-zinc-500 animate-pulse ml-12 font-sans">
                <div className="w-1 h-3.5 bg-zinc-600" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Process: Analyzing repository...</span>
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Input Area */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Model Selector Bar */}
          <div className="flex items-center justify-between px-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-fit h-7 bg-zinc-950/50 border-zinc-800/50 text-[10px] font-bold uppercase tracking-widest gap-2 focus:ring-0">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-zinc-500" />
                  <SelectValue placeholder="Select Model" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                {AVAILABLE_MODELS.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-[10px] uppercase tracking-widest focus:bg-zinc-800 focus:text-indigo-400">
                    <div className="flex flex-col py-0.5">
                      <span className="font-bold">{m.name}</span>
                      <span className="text-[8px] opacity-50 lowercase font-mono">{m.account}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-bold uppercase tracking-tight">
                  <Zap className="w-3 h-3" />
                  <span>Turbo Boost Active</span>
               </div>
               <div className="h-3 w-[1px] bg-zinc-800" />
               <span className="text-[9px] text-zinc-600 font-mono">1.2s Context</span>
            </div>
          </div>

          <form 
            onSubmit={handleSubmit} 
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-xl transition-all focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/10"
          >
            <div className="flex gap-3 items-start">
              <div className="mt-1 text-zinc-500 bg-zinc-800/50 p-1.5 rounded border border-zinc-700/50">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <textarea
                placeholder="Ask Copilot or use '/' for commands..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isTyping}
                className="bg-transparent resize-none outline-none text-sm text-zinc-200 w-full h-12 py-1 placeholder:text-zinc-600 font-sans"
              />
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
              <div className="flex gap-2">
                <Badge variant="outline" className="h-6 bg-zinc-800/50 border-zinc-700/50 text-zinc-500 text-[9px] font-mono px-2">
                   ⌘ K Commands
                </Badge>
                <Badge variant="outline" className="h-6 bg-zinc-800/50 border-zinc-700/50 text-zinc-500 text-[9px] font-mono px-2">
                   @ Context
                </Badge>
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="h-8 px-5 bg-zinc-100 text-zinc-950 rounded-lg text-[11px] font-bold hover:bg-white transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isTyping ? "Processing..." : "Send Prompt"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
