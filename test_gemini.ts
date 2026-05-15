import { orchestrator } from "./src/services/gemini.ts";

async function runTest() {
  console.log("🚀 Initializing Gemini Orchestrator...");
  try {
    await orchestrator.initialize("gemini-1.5-flash");
    console.log("✅ Initialization successful!");

    console.log("💬 Sending test prompt: 'What is the capital of France?'");
    const messages = [
      { role: "user", content: "What is the capital of France?", timestamp: new Date() }
    ];

    let fullResponse = "";
    // Note: using gemini-1.5-flash as default to be safe
    for await (const chunk of orchestrator.streamChat(messages as any, "gemini-1.5-flash")) {
      fullResponse += chunk;
      process.stdout.write(chunk);
    }
    console.log("\n\n✅ Stream completed!");
    console.log("Full Response:", fullResponse);

    if (fullResponse.toLowerCase().includes("paris")) {
      console.log("🌟 PROMPT TEST PASSED!");
    } else {
      console.log("❌ PROMPT TEST FAILED (Incorrect response)");
    }
  } catch (error: any) {
    console.error("❌ Test failed with error:", error.message || error);
  }
}

runTest();
