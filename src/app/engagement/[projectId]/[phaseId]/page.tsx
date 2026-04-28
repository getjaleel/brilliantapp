import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Circle,
  CircleDashed,
  BrainCircuit,
  FileText,
  ArrowLeft,
  Save,
  ChevronRight,
  Sparkles,
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PhaseExecutionPage({ params }: { params: { projectId: string; phaseId: string } }) {
  const { projectId, phaseId } = params;

  const projectResult = await query('SELECT * FROM "Project" WHERE id = $1', [projectId]);
  const project = projectResult.rows[0];

  const phaseResult = await query('SELECT * FROM "EngagementPhase" WHERE id = $1', [phaseId]);
  const phase = phaseResult.rows[0];

  const tasksResult = await query('SELECT * FROM "PhaseTask" WHERE "phaseId" = $1 ORDER BY "createdAt" ASC', [phaseId]);
  const tasks = tasksResult.rows;

  if (!project || !phase) {
    return <div className="p-8 text-center">Project or Phase not found.</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{phase.name}</h1>
            <p className="text-slate-500">{phase.purpose}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-3 py-1">{phase.status}</Badge>
          <Button className="gap-2">
            <Save className="w-4 h-4" /> Save Progress
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Phase Requirements & Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 transition-colors">
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{task.title}</div>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {task.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{task.description}</p>

                    {task.category === "Question" && (
                      <div className="space-y-2 pt-2">
                        <Label className="text-xs text-slate-400">Client Response</Label>
                        <Textarea
                          placeholder="Enter findings from discovery interview..."
                          className="text-xs min-h-[80px]"
                        />
                      </div>
                    )}

                    {task.category === "Input" && (
                      <div className="flex items-center gap-3 pt-2">
                        <Input placeholder="Reference document or data source..." className="h-8 text-xs" />
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                          <FileText className="w-3 h-3" /> Upload
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-center pt-4">
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Custom Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-slate-100 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2 text-blue-400">
                <BrainCircuit className="w-5 h-5" />
                AI Phase Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg font-mono text-xs space-y-3 border border-slate-700">
                <div className="text-blue-400">assistant:</div>
                <div className="text-slate-300 italic leading-relaxed">
                  "I&apos;ve analyzed the project context. For this {phase.name} phase, you should prioritize identifying the &apos;Shadow IT&apos; landscape and any legacy dependencies that could block the target architecture."
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="w-full justify-start text-left text-xs gap-2 bg-slate-800 text-slate-300 hover:text-white border-slate-700">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Draft Discovery Questions
                </Button>
                <Button variant="outline" className="w-full justify-start text-left text-xs gap-2 bg-slate-800 text-slate-300 hover:text-white border-slate-700">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Map Controls to Phase
                </Button>
                <Button variant="outline" className="w-full justify-start text-left text-xs gap-2 bg-slate-800 text-slate-300 hover:text-white border-slate-700">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Generate Phase Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md font-semibold">Phase Outcomes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-500">Draft Questionnaire</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-500">Stakeholder Map</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-500">Current State Doc</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <Button className="w-full mt-4 gap-2">
                Mark Phase Complete <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
