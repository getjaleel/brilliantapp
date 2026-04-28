import AIPromptLibrary from "@/components/AIPromptLibrary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, BarChart3, DollarSign, Rocket, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const tools = [
  {
    title: "Validate Business Idea",
    description: "Analyze customer, problem, revenue model, competitors, and hidden risks.",
    icon: Lightbulb,
    color: "text-amber-600",
  },
  {
    title: "Market Research",
    description: "Market size, growth trends, underserved segments, and top opportunities.",
    icon: BarChart3,
    color: "text-blue-600",
  },
  {
    title: "Design Revenue Model",
    description: "3 pricing options, CAC estimates, and 12-month revenue projections.",
    icon: DollarSign,
    color: "text-emerald-600",
  },
  {
    title: "Launch Plan",
    description: "Week-by-week 90-day plan with milestones, marketing, and first 10 steps.",
    icon: Rocket,
    color: "text-rose-600",
  },
  {
    title: "One-Page Pitch",
    description: "Compelling summary: problem, solution, market, revenue, and timing.",
    icon: FileText,
    color: "text-violet-600",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-500" />
          AI Business Tools
        </h1>
        <p className="text-slate-500 mt-1">
          Validate ideas, research markets, model revenue, and plan launches with AI-powered prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card key={tool.title} className="hover:border-purple-200 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <tool.icon className={`w-5 h-5 ${tool.color}`} />
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AIPromptLibrary />
    </div>
  );
}
