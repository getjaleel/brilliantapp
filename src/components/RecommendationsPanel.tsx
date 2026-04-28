"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  Sparkles,
  FileText,
  BookOpen,
  CheckCircle,
  Loader2,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface RecTemplate {
  id: string;
  name: string;
  category: string;
  docType: string;
  score: number;
  reason: string;
}

interface RecKnowledge {
  id: string;
  title: string;
  domain: string;
  score: number;
  reason: string;
}

interface RecResponse {
  ok: boolean;
  aiEnhanced?: boolean;
  summary?: string;
  templates?: RecTemplate[];
  knowledge?: RecKnowledge[];
  error?: string;
}

const categoryColors: Record<string, string> = {
  "Cloud Security": "bg-sky-100 text-sky-700",
  "Network Security": "bg-emerald-100 text-emerald-700",
  "Identity & Access": "bg-violet-100 text-violet-700",
  "Data Protection": "bg-amber-100 text-amber-700",
  "Incident & Compliance": "bg-rose-100 text-rose-700",
  "Application Security": "bg-indigo-100 text-indigo-700",
  Policies: "bg-slate-100 text-slate-700",
};

export default function RecommendationsPanel({ projectId }: { projectId: string }) {
  const [data, setData] = useState<RecResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [instantiating, setInstantiating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData({ ok: false, error: "Failed to load recommendations" });
        setLoading(false);
      });
  }, [projectId]);

  async function instantiateTemplate(templateId: string, templateName: string) {
    setInstantiating(templateId);
    const formData = new FormData();
    formData.append("templateId", templateId);
    formData.append("projectId", projectId);
    formData.append("artefactName", `${templateName} — Recommended`);
    await fetch("/api/templates/instantiate", {
      method: "POST",
      body: formData,
    });
    setInstantiating(null);
    window.location.href = `/artefacts/${projectId}`;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Analysing project context...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.ok) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          {data?.error || "Could not generate recommendations."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-semibold flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            Smart Recommendations
            {data.aiEnhanced && (
              <Badge variant="outline" className="text-[10px] gap-1 ml-2">
                <Sparkles className="w-3 h-3" /> AI Enhanced
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.summary && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs">
              <div className="text-blue-400 mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Analysis
              </div>
              <div className="text-slate-300 leading-relaxed italic">{data.summary}</div>
            </div>
          )}

          {data.templates && data.templates.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Recommended Templates
              </div>
              <div className="space-y-2">
                {data.templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{t.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            categoryColors[t.category] ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.reason}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${t.score}%` }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] gap-1"
                        onClick={() => instantiateTemplate(t.id, t.name)}
                        disabled={instantiating === t.id}
                      >
                        {instantiating === t.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.knowledge && data.knowledge.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Relevant Knowledge
              </div>
              <div className="space-y-2">
                {data.knowledge.map((k) => (
                  <Link key={k.id} href="/knowledge">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{k.title}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {k.domain}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {k.reason}
                        </div>
                      </div>
                      <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 ml-3">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${k.score}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
