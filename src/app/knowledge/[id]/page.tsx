import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, HelpCircle, Download, Upload, FileOutput, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const domainColors: Record<string, string> = {
  TOGAF: "bg-slate-100 text-slate-700",
  AWS: "bg-orange-100 text-orange-700",
  Cyber: "bg-red-100 text-red-700",
  APRA: "bg-blue-100 text-blue-700",
  DataGov: "bg-emerald-100 text-emerald-700",
};

export default async function KnowledgeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const result = await query('SELECT * FROM "KnowledgeItem" WHERE id = $1', [id]);
  const item = result.rows[0];
  if (!item) return notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/knowledge" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
            <Badge className={`text-[10px] ${domainColors[item.domain] ?? "bg-slate-100 text-slate-700"}`}>
              {item.domain}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
        </div>
      </div>

      {item.usage && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              When to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{item.usage}</p>
          </CardContent>
        </Card>
      )}

      {item.questions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Key Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {item.questions.split("?").filter(Boolean).map((q: string, i: number) => (
                <li key={i}>{q.trim()}?</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {item.inputs && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              Required Inputs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{item.inputs}</p>
          </CardContent>
        </Card>
      )}

      {item.outputs && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileOutput className="w-4 h-4 text-purple-500" />
              Expected Outputs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{item.outputs}</p>
          </CardContent>
        </Card>
      )}

      {item.controls && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              Related Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{item.controls}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
