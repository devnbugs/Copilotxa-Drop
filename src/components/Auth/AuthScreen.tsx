import { useState } from "react";
import { motion } from "motion/react";
import { Terminal, Cloud, Key, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { PremiumLogo } from "@/components/ui/PremiumLogo";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState(0);

  const handleAuth = (method: string) => {
    setSelectedMethod(method);
    setIsAuthenticating(true);
    setAuthStep(1);

    // Simulate auth flow
    setTimeout(() => {
      setAuthStep(2);
      setTimeout(() => {
        setAuthStep(3);
        setTimeout(() => {
          onAuthenticated();
        }, 800);
      }, 1500);
    }, 1200);
  };

  const methods = [
    {
      id: 'gemini-cli',
      title: 'Gemini CLI config',
      description: 'Use the locally stored gemini CLI config. Useful for individual devs.',
      icon: Terminal,
      command: 'gemini login',
      color: 'text-indigo-400',
      bgHover: 'hover:bg-indigo-500/5',
      borderFocus: 'border-indigo-500/50 ring-indigo-500/20'
    },
    {
      id: 'gcp-adc',
      title: 'GCP ADC',
      description: 'Application Default Credentials via gcloud. Recommended for enterprise.',
      icon: Cloud,
      command: 'gcloud auth application-default login',
      color: 'text-blue-400',
      bgHover: 'hover:bg-blue-500/5',
      borderFocus: 'border-blue-500/50 ring-blue-500/20'
    },
    {
      id: 'custom-key',
      title: 'API Key',
      description: 'Provide a static Google AI Studio or Vertex AI key manually.',
      icon: Key,
      command: 'export GEMINI_API_KEY="..."',
      color: 'text-emerald-400',
      bgHover: 'hover:bg-emerald-500/5',
      borderFocus: 'border-emerald-500/50 ring-emerald-500/20'
    }
  ];

  return (
    <div className="flex h-screen w-full bg-[#000000] text-zinc-300 items-center justify-center relative overflow-hidden font-sans">
      
      {/* Visual noise / grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#000000] to-[#000000] opacity-50" />
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 p-8">
        
        {/* Left column: Branding & Title */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center shadow-2xl">
            <PremiumLogo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Authenticate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Gemini Workspace
              </span>
            </h1>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-sm">
              Connect your local environment to the Gemini API securely. Choose a preferred authentication method to grant access to the CLI agent.
            </p>
          </div>
        </div>

        {/* Right column: Auth Methods */}
        <div className="bg-[#050505] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-center min-h-[500px]">
          
          {!isAuthenticating ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select Provider</span>
              </div>

              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleAuth(m.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border border-white/5 bg-[#0a0a0a] transition-all duration-300 group relative overflow-hidden",
                    m.bgHover,
                    "hover:border-white/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl bg-black border border-white/5 shadow-inner", m.color)}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <h3 className="text-sm font-bold text-zinc-200">{m.title}</h3>
                      <p className="text-xs text-zinc-500">{m.description}</p>
                      
                      <div className="mt-3 bg-black/50 p-2 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="font-mono text-[10px] text-zinc-600 block">$ {m.command}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 mt-3" />
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center h-full space-y-8 text-center"
             >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0a0a]">
                     {authStep < 3 ? (
                       <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                     ) : (
                       <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                     )}
                  </div>
                  {authStep < 3 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-indigo-500/30"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="301.59"
                        initial={{ strokeDashoffset: 301.59 }}
                        animate={{ strokeDashoffset: 301.59 - (301.59 * (authStep / 3)) }}
                        transition={{ duration: 1 }}
                        className="text-indigo-400"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    {authStep === 1 && "Initializing Auth Flow"}
                    {authStep === 2 && "Validating Credentials"}
                    {authStep === 3 && "Authentication Successful"}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {authStep === 1 && `Executing command proxy for ${selectedMethod}...`}
                    {authStep === 2 && "Checking token scopes and expiration..."}
                    {authStep === 3 && "Redirecting to workspace..."}
                  </p>
                </div>
             </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
