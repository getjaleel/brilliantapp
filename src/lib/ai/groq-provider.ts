import { AIProvider } from "./provider";

export class GroqProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
  }

  async chat(messages: { role: string; content: string }[], options?: { temperature?: number; maxTokens?: number }) {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama3-8b-8192",
          messages: messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("GroqProvider Error:", error);
      throw error;
    }
  }
}
