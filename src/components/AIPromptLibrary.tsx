"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Lightbulb,
  BarChart3,
  DollarSign,
  Rocket,
  FileText,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  placeholder: string;
  color: string;
}

const templates: PromptTemplate[] = [
  {
    id: "validate-idea",
    title: "Validate Business Idea",
    description: "Customer, problem, revenue, competitors, hidden risks",
    icon: <Lightbulb className="w-4 h-4" />,
    prompt:
      "Analyze this business idea: {input}. Tell me who the customer is, what problem it solves, how it makes money, the top 3 competitors, and 3 risks I am probably not seeing.",
    placeholder:
      "Describe your business idea. For example: A subscription-based meal kit service focused on keto diets for busy professionals in Melbourne...",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "market-research",
    title: "Market Research",
    description: "Market size, growth, underserved segments, top opportunity",
    icon: <BarChart3 className="w-4 h-4" />,
    prompt:
      "Act as a senior market research analyst. Research the {input} market. Give me market size, growth trends, biggest underserved segments, and the number one opportunity to target first.",
    placeholder:
      "Describe the industry and target customer. For example: The Australian cybersecurity consulting market for mid-size financial institutions...",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "revenue-model",
    title: "Design Revenue Model",
    description: "3 pricing options, CAC, 12-month revenue projection",
    icon: <DollarSign className="w-4 h-4" />,
    prompt:
      "Create 3 revenue model options for {input}. For each one give me pricing, estimated customer acquisition cost, and a realistic 12 month revenue projection. Be specific.",
    placeholder:
      "Describe your business type. For example: A B2B SaaS platform for construction project management...",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "launch-plan",
    title: "Launch Plan",
    description: "Week-by-week plan, milestones, marketing, first 10 steps",
    icon: <Rocket className="w-4 h-4" />,
    prompt:
      "Create a week by week 90-day launch plan for {input}. Include product milestones, marketing actions, and the first 10 steps to get my first paying customer.",
    placeholder:
      "Describe your business. For example: A mobile app that connects freelance graphic designers with small business owners...",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "one-page-pitch",
    title: "One-Page Pitch",
    description: "Compelling summary: problem, solution, market, revenue, timing",
    icon: <FileText className="w-4 h-4" />,
    prompt:
      "Summarize this business into a one page pitch: {input}. Include the problem, solution, target market, revenue model, and why this opportunity exists right now. Make it compelling.",
    placeholder:
      "Paste your business details here. For example: We are building an AI-powered...",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
];

export default function AIPromptLibrary() {
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function runPrompt(template: PromptTemplate) {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const prompt = template.prompt.replace("{input}", input.trim());
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "EXECUTIVE" }),
      });
      const data = await res.json();
      if (data.ok && data.response) {
        setResult(data.response);
      } else {
        setResult(
          "Could not generate response. Make sure an AI provider is configured (Ollama or Groq)."
        );
      }
    } catch {
      setResult("Error calling AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Business Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-500">
          Quick-start prompts to validate ideas, research markets, and plan launches.
        </p>
        <div className="space-y-2">
          {templates.map((t) => (
            <Dialog key={t.id}>
              <DialogTrigger
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left hover:shadow-sm transition-all ${t.color}`}
                onClick={() => {
                  setActiveTemplate(t);
                  setInput("");
                  setResult("");
                }}
              >
                <div className="shrink-0">{t.icon}</div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{t.title}</div>
                  <div className="text-xs opacity-80 truncate">{t.description}</div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {t.icon}
                    {t.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Your Input
                    </label>
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t.placeholder}
                      className="min-h-[120px] text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => runPrompt(t)}
                    disabled={loading || !input.trim()}
                    className="w-full gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {loading ? "Generating..." : "Run Prompt"}
                  </Button>
                  {result && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Result
                      </div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap">
                        {result}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
