import { GoogleGenAI } from "@google/genai";

// Safe access to localStorage for Node/Browser compatibility
const getStorageItem = (key: string): string | null => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const apiKey = process.env.GEMINI_API_KEY || getStorageItem('GEMINI_API_KEY') || "";

export type Message = {
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
};

class GeminiOrchestrator {
  private static instance: GeminiOrchestrator;
  private genAI: GoogleGenAI | null = null;

  private constructor() {
    if (apiKey) {
      // In @google/genai, the constructor takes an options object
      this.genAI = new GoogleGenAI({ apiKey });
    } else {
      // If no API key, we might still initialize it to allow CLI fallback checks
      this.genAI = new GoogleGenAI({});
    }
  }

  public static getInstance(): GeminiOrchestrator {
    if (!GeminiOrchestrator.instance) {
      GeminiOrchestrator.instance = new GeminiOrchestrator();
    }
    return GeminiOrchestrator.instance;
  }

  public async initialize(modelName: string) {
    // Basic connectivity/auth check if needed
    if (!this.genAI) throw new Error("Gemini AI Client not initialized.");
    return true;
  }

  public async* streamChat(messages: Message[], modelName: string = "gemini-1.5-flash") {
    const authMethod = getStorageItem('GEMINI_AUTH_METHOD') || 'cli';
    
    // If using CLI or Vertex, we force the bridge fallback
    if (authMethod === 'cli' || authMethod === 'vertex') {
      console.log(`Using ${authMethod} authentication via CLI bridge...`);
      
      const lastMessage = messages[messages.length - 1].content;
      const systemMsg = messages.find(m => m.role === 'system')?.content;
      const prompt = systemMsg ? `${systemMsg}\n\n${lastMessage}` : lastMessage;

      const extraEnv: Record<string, string> = {};
      if (authMethod === 'vertex') {
        extraEnv['GOOGLE_CLOUD_PROJECT'] = getStorageItem('GCP_PROJECT_ID') || '';
        extraEnv['GOOGLE_CLOUD_LOCATION'] = getStorageItem('GCP_LOCATION') || 'us-central1';
      }

      // Sanitize prompt for shell execution (Windows-safe)
      const sanitizedPrompt = prompt
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ') // Replace newlines with spaces for single-command execution
        .replace(/\r/g, '');

      try {
        const response = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            command: `gemini prompt "${sanitizedPrompt}"`,
            env: extraEnv
          })
        });
        const data = await response.json();
        if (data.stdout) {
          yield data.stdout;
          return;
        }
        throw new Error(data.stderr || data.error || "CLI prompt failed.");
      } catch (e: any) {
        throw new Error(`Gemini CLI Fallback Failed: ${e.message}. Ensure 'gemini' CLI is installed and you have run 'gemini auth login'.`);
      }
    }

    if (!this.genAI) throw new Error("Gemini AI Client not initialized. Please check your API Key settings.");

    try {
      // Map model names if needed
      let actualModel = modelName;
      if (modelName.includes("3.1-pro")) actualModel = "gemini-1.5-pro";
      if (modelName.includes("3.0-flash")) actualModel = "gemini-1.5-flash";
      if (modelName.includes("3.0-pro")) actualModel = "gemini-1.5-pro";

      // Separate system instructions from history
      const systemInstruction = messages.find(m => m.role === 'system')?.content;
      const history = messages
        .filter(m => m.role !== 'system')
        .slice(0, -1)
        .map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const lastMessage = messages[messages.length - 1].content;

      // In @google/genai, we use ai.models.generateContentStream
      const result = await this.genAI.models.generateContentStream({
        model: actualModel,
        contents: [
          ...history,
          { role: 'user', parts: [{ text: lastMessage }] }
        ],
        config: {
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        }
      });

      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error: any) {
      console.error("Gemini Streaming Error:", error);
      throw error;
    }
  }

  public getSkills() {
    return [
      { id: 'fs', name: 'File System', description: 'Read and write local files.' },
      { id: 'shell', name: 'Shell Executor', description: 'Run system commands.' }
    ];
  }

  public activateSkill(name: string) {
    console.log(`Skill activated: ${name}`);
  }
}

export const orchestrator = GeminiOrchestrator.getInstance();

export async function* streamChat(messages: Message[], modelName: string = "gemini-1.5-flash") {
  yield* orchestrator.streamChat(messages, modelName);
}
