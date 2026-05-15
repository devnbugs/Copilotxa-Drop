import { useState } from "react";
import { motion } from "motion/react";
import { Terminal, Cloud, Key, CheckCircle2, Loader2, ArrowRight, ShieldCheck, UserCircle2 } from "lucide-react";
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
      id: 'oauth-google',
      title: 'Sign in with Google',
      description: 'Use your personal or organization workspace account.',
      icon: UserCircle2,
      command: 'google auth login',
      color: 'text-indigo-500',
      tag: 'Recommended'
    },
    {
      id: 'gemini-key',
      title: 'Use Gemini API Key',
      description: 'Provide an API key from Google AI Studio.',
      icon: Key,
      command: 'export GEMINI_API_KEY="..."',
      color: 'text-emerald-500',
    },
    {
      id: 'vertex-ai',
      title: 'Sign in with Vertex AI',
      description: 'Use Application Default Credentials, Service Accounts, or API keys.',
      icon: Cloud,
      command: 'gcloud auth application-default login',
      color: 'text-blue-400',
    }
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground relative overflow-hidden font-sans">
      
      {/* Left Side: Enterprise Branding & Graphic */}
      <div className="hidden lg:flex flex-col w-[45%] h-full bg-muted/30 border-r border-border p-12 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-background to-background opacity-50 blur-3xl pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 flex items-center gap-3 mb-16">
          <PremiumLogo className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">Gemini CLI Enterprise</span>
        </div>

        <div className="relative z-10 my-auto">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Secure, Managed <br /> AI Tools for Enterprise
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed mb-8">
            Access centrally managed model configurations, strict sandbox policies, and role-based MCP tools.
          </p>

          <div className="flex flex-col gap-4">
            {[
              "Sign in with Google for individuals & orgs",
              "Bring your own AI Studio API Key",
              "Enterprise Vertex AI ADC Support",
              "Seamless GCP project integration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between text-xs text-muted-foreground">
           <span>Version 24.1.0</span>
           <span>Enterprise Edition</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Mobile logo only */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <PremiumLogo className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">Gemini CLI</span>
          </div>

          <div className="w-full max-w-md">
            {!isAuthenticating ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Sign in to your account</h2>
                  <p className="text-muted-foreground text-sm">
                    Your administrator requires authentication to access Gemini CLI resources and MCP tools.
                  </p>
                </div>

                <div className="space-y-4">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleAuth(m.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border border-border bg-card transition-all duration-300 group relative overflow-hidden hover:border-foreground/30 hover:shadow-md hover:-translate-y-0.5",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2.5 rounded-lg bg-background border border-border mt-0.5 shadow-sm", m.color)}>
                          <m.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center justify-between">
                             <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                             {m.tag && (
                               <span className="text-[9px] uppercase tracking-widest font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md">
                                 {m.tag}
                               </span>
                             )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 text-center text-[11px] text-muted-foreground">
                  By signing in, you agree to your organization's <br/>
                  <a href="#" className="underline hover:text-foreground">Acceptable Use Policy</a> and <a href="#" className="underline hover:text-foreground">Terms of Service</a>.
                </div>
              </motion.div>
            ) : (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-20 space-y-8 text-center"
               >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border border-border flex items-center justify-center bg-card shadow-lg">
                       {authStep < 3 ? (
                         <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                       ) : (
                         <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                       )}
                    </div>
                    {authStep < 3 && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-muted"
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
                          className="text-indigo-500"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {authStep === 1 && "Initiating Secure Login"}
                      {authStep === 2 && "Verifying Domain Policies"}
                      {authStep === 3 && "Authentication Successful"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {authStep === 1 && `Routing via ${selectedMethod}...`}
                      {authStep === 2 && "Enforcing system-defaults.json overrides..."}
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
