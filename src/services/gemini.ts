import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your secrets.");
  }
  return new GoogleGenAI({ apiKey });
};

export type Message = {
  role: "user" | "model";
  content: string;
  timestamp: Date;
};

export async function* streamChat(messages: Message[], modelName: string = "gemini-3-flash-preview") {
  const ai = getAI();
  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: `You are Gemini Copilot, a high-performance productivity assistant. 
      Your personality is "Gemini CLI" - efficient, technical, and precise.
      You support coding, system architecture, and general productivity.
      NEW CAPABILITY: You are integrated with a local System Agent (accessible via the "Agent" tab).
      You can "scan" Windows health, services, and events. 
      You can also trigger hardware toggles (Wifi, BT, Flight Mode) via simulated tools.
      When providing code, always use triple backticks with the correct language identifier.
      Keep responses concise unless asked for depth.
      Current environment: React + Vite + Tailwind CSS + Magic UI + Bricolage Grotesque.`,
    },
  });

  const lastMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  // Create chat with history
  const chatWithHistory = ai.chats.create({
    model: modelName,
    history: history,
  });

  const response = await chatWithHistory.sendMessageStream({
    message: lastMessage.content,
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
