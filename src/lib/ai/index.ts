import { OllamaProvider } from "./ollama-provider";
import { GroqProvider } from "./groq-provider";
import { PromptBuilder } from "./prompt-builder";

export async function getAIRecommendation(mode: string, projectContext: any, message: string) {
  let provider;

  if (process.env.AI_PROVIDER === "groq") {
    provider = new GroqProvider();
  } else {
    provider = new OllamaProvider();
  }

  const prompt = PromptBuilder.buildChatPrompt(mode, projectContext, message);
  return await provider.chat(prompt);
}
