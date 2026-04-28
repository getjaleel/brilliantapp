import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  CircleDashed,
  FileText,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const projectResult = await query(
    'SELECT p.*, c.name as "clientName" FROM "Project" p JOIN "Client" c ON p."clientId" = c.id WHERE p.id = $1',
    [id]
  );
  const project = projectResult.rows[0];

  if (!project) {
    return <div className="p-8 text-center">Project not found.</div>;
  }

  const phasesResult = await query(
    'SELECT * FROM "EngagementPhase" WHERE "projectId" = $1 ORDER BY "order" ASC',
    [id]
  );
  const phases = phasesResult.rows;

  const risksResult = await query(
    'SELECT * FROM "Risk" WHERE "projectId" = $1',
    [id]
  );
  const risks = risksResult.rows;

  const controlsResult = await query(
    'SELECT * FROM "Control" WHERE "projectId" = $1',
    [id]
  );
  const controls = controlsResult.rows;

  const artefactsResult = await query(
    'SELECT * FROM "Artefact" WHERE "projectId" = $1 ORDER BY "createdAt" DESC',
    [id]
  );
  const artefacts = artefactsResult.rows;

  const completedPhases = phases.filter((p: any) => p.status === 'COMPLETED').length;
  const progress = phases.length > 0 ? (completedPhases / phases.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-slate-500">{project.clientName} • {project.status}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {project.cloudProvider || "Cloud Agnostic"}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-600 border-blue-200">
            AI Enabled
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Engagement Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Completion</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Active Risks</div>
                    <div className="text-lg font-bold">{risks.length}</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Controls Met</div>
                    <div className="text-lg font-bold">{controls.filter((c: any) => c.status === 'MET').length} / {controls.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Lifecycle Phases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {phases.map((phase: any) => (
                  <div
                    key={phase.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {phase.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : phase.status === 'IN_PROGRESS' ? (
                        <CircleDashed className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                      <div>
                        <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">{phase.name}</div>
                        <div className="text-xs text-slate-500">{phase.purpose}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] uppercase">{phase.status}</Badge>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs">
                <div className="text-blue-400 mb-2">Analysis:</div>
                <div className="text-slate-300 leading-relaxed italic">
                  "Based on the current phase ({phases[0]?.name}), I recommend documenting the current state networking topology before proceeding to requirements."
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <BrainCircuit className="w-4 h-4" />
                Open AI Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Key Artefacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {artefacts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No artefacts generated yet.</p>
              ) : (
                artefacts.map((art: any) => (
                  <div key={art.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 text-xs hover:bg-slate-50 cursor-pointer">
                    <span className="font-medium">{art.name}</span>
                    <Badge variant="outline" className="text-[10px]">{art.type}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AlertTriangle(props: any) { return <div className="w-4 h-4 bg-red-500 rounded-full" {...props} />; }
function ShieldCheck(props: any) { return <div className="w-4 h-4 bg-green-500 rounded-full" {...props} />; }
