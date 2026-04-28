import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const categoryColors: Record<string, string> = {
  "Cloud Security": "bg-sky-100 text-sky-700",
  "Network Security": "bg-emerald-100 text-emerald-700",
  "Identity & Access": "bg-violet-100 text-violet-700",
  "Data Protection": "bg-amber-100 text-amber-700",
  "Incident & Compliance": "bg-rose-100 text-rose-700",
  "Application Security": "bg-indigo-100 text-indigo-700",
  Policies: "bg-slate-100 text-slate-700",
};

const docTypeColors: Record<string, string> = {
  Template: "border-blue-200 text-blue-700",
  Tracker: "border-green-200 text-green-700",
  Report: "border-purple-200 text-purple-700",
  Sheet: "border-orange-200 text-orange-700",
  Policy: "border-slate-300 text-slate-700",
};

export default async function TemplatesPage() {
  const result = await query(
    'SELECT * FROM "DocumentTemplate" ORDER BY category, name',
    []
  );
  const templates = result.rows;

  const categories = Array.from(
    new Set(templates.map((t: any) => t.category))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-500" />
          Document Templates
        </h1>
        <p className="text-slate-500 mt-1">
          35 cybersecurity templates, trackers, reports, and policies ready to
          instantiate.
        </p>
      </div>

      {categories.map((category) => {
        const items = templates.filter((t: any) => t.category === category);
        return (
          <section key={category} className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  categoryColors[category]?.split(" ")[0] ?? "bg-slate-200"
                }`}
              />
              {category}
              <Badge variant="secondary" className="text-[10px]">
                {items.length}
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((t: any) => (
                <Link key={t.id} href={`/templates/${t.id}`}>
                  <Card className="h-full hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold leading-snug">
                          {t.name}
                        </CardTitle>
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            docTypeColors[t.docType] ?? ""
                          }`}
                        >
                          {t.docType}
                        </Badge>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            categoryColors[t.category] ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
