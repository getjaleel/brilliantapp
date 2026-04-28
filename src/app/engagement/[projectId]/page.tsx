import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, ChevronRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectEngagementPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;

  const projectResult = await query(
    'SELECT * FROM "Project" WHERE id = $1',
    [projectId]
  );
  const project = projectResult.rows[0];

  if (!project) return <div>Project not found</div>;

  const phasesResult = await query(
    'SELECT * FROM "EngagementPhase" WHERE "projectId" = $1 ORDER BY "order" ASC',
    [projectId]
  );
  const phases = phasesResult.rows;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Lifecycle</h1>
          <p className="text-slate-500">Executing the architecture methodology for {project.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Project Overview
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {phases.map((phase: any) => (
            <Card key={phase.id} className="group hover:border-blue-300 transition-all cursor-pointer">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${phase.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    {phase.order}
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">{phase.name}</h3>
                    <p className="text-xs text-slate-500">{phase.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] uppercase">{phase.status}</Badge>
                  <Link
                    href={`/engagement/${projectId}/${phase.id}`}
                    className="p-2 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-slate-100 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2 text-blue-400">
                <BrainCircuit className="w-5 h-5" />
                Phase Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs font-mono text-slate-400 italic leading-relaxed">
                "Based on current progress, the '{phases.find((p: any) => p.status === 'IN_PROGRESS')?.name || 'Current State Assessment'}' is the critical path. Ensure all technical diagrams are validated by the client's lead engineer before moving to Target Architecture."
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1">
                Ask AI for Next Steps
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
