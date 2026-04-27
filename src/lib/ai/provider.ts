export interface AIProvider {
  chat(messages: { role: string; content: string }[], options?: { temperature?: number; maxTokens?: number });
}
