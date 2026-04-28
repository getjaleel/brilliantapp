import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Copy, CheckCircle } from "lucide-react";
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

export default async function TemplateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const result = await query(
    'SELECT * FROM "DocumentTemplate" WHERE id = $1',
    [id]
  );
  const template = result.rows[0];
  if (!template) return notFound();

  const projectsResult = await query(
    'SELECT id, name FROM "Project" ORDER BY name',
    []
  );
  const projects = projectsResult.rows;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {template.name}
            </h1>
            <Badge
              variant="outline"
              className={`text-[10px] ${docTypeColors[template.docType] ?? ""}`}
            >
              {template.docType}
            </Badge>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                categoryColors[template.category] ??
                "bg-slate-100 text-slate-700"
              }`}
            >
              {template.category}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {template.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Template Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-[70vh]">
                {template.content}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Create Artefact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">
                Instantiate this template as an artefact for a project.
              </p>
              {projects.length === 0 ? (
                <div className="text-xs text-slate-400">
                  No projects available.
                </div>
              ) : (
                <form
                  action="/api/templates/instantiate"
                  method="POST"
                  className="space-y-3"
                >
                  <input type="hidden" name="templateId" value={template.id} />
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Project
                    </label>
                    <select
                      name="projectId"
                      required
                      className="w-full text-xs rounded-md border border-slate-200 bg-white px-2 py-1.5"
                    >
                      <option value="">Select project...</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Artefact Name
                    </label>
                    <input
                      name="artefactName"
                      defaultValue={`${template.name} — Draft`}
                      required
                      className="w-full text-xs rounded-md border border-slate-200 bg-white px-2 py-1.5"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full gap-1 text-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Instantiate
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Placeholders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-2">
                Replace these when drafting:
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.from(
                  new Set(
                    (template.content.match(/\{\{[A-Z_0-9]+\}\}/g) || []) as string[]
                  )
                )
                  .slice(0, 20)
                  .map((ph) => (
                    <Badge
                      key={ph}
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {ph}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
