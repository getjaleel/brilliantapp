import { SYSTEM_PROMPTS } from "./system-prompts";

export class PromptBuilder {
  static buildChatPrompt(mode: string, projectContext: any, userMessage: string) {
    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.GENERAL;

    const contextString = projectContext
      ? `Project Context: ${JSON.stringify(projectContext)}`
      : "No project context provided.";

    return [
      { role: "system", content: `${systemPrompt}\n\n${contextString}` },
      { role: "user", content: userMessage },
    ];
  }
}
